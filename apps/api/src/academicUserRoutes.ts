import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { fail, ok } from "./response.js";

// ── Zod schemas ──

const addTeacherSchema = z.object({
  name: z.string().trim().min(1).max(50),
  college: z.string().trim().max(50).optional().default(""),
  department: z.string().trim().max(50).optional().default(""),
});

const submitReviewSchema = z.object({
  teacherId: z.string().min(1),
  courseName: z.string().trim().min(1).max(80),
  grading: z.number().int().min(1).max(5),
  attendance: z.number().int().min(1).max(5),
  difficulty: z.number().int().min(1).max(5),
  recommend: z.number().int().min(1).max(5),
  examFocus: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(""),
});

const submitMaterialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  courseId: z.string().min(1),
  files: z.array(
    z.object({
      fileName: z.string().min(1),
      fileKey: z.string().min(1),
      fileUrl: z.string().min(1),
      fileSize: z.number().int().nonnegative().default(0),
      mimeType: z.string().max(100).default(""),
    })
  ).default([]),
});

export async function academicUserRoutes(app: FastifyInstance) {
  // ── 添加教师（待审核） ──
  app.post("/api/user/teachers", async (request, reply) => {
    const auth = request.user as { sub: string };
    const parsed = addTeacherSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "参数错误");

    // 检查是否已存在同名教师
    const existing = await prisma.teacher.findFirst({
      where: {
        name: parsed.data.name,
        college: parsed.data.college,
      },
    });
    if (existing) {
      return fail(reply, "DUPLICATE", "该教师已存在" + (existing.status === "PENDING" ? "，正在审核中" : ""));
    }

    const teacher = await prisma.teacher.create({
      data: {
        ...parsed.data,
        addedByUserId: auth.sub,
        status: "PENDING",
      },
    });
    return ok(reply, { id: teacher.id, status: teacher.status }, "提交成功，审核后展示");
  });

  // ── 提交评价 ──
  app.post("/api/user/reviews", async (request, reply) => {
    const auth = request.user as { sub: string };
    const parsed = submitReviewSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "评价参数错误");

    // 检查教师是否存在
    const teacher = await prisma.teacher.findUnique({
      where: { id: parsed.data.teacherId },
    });
    if (!teacher) return fail(reply, "NOT_FOUND", "教师不存在", 404);

    // 检查是否已评价过该教师
    const existing = await prisma.teacherReview.findFirst({
      where: {
        teacherId: parsed.data.teacherId,
        userId: auth.sub,
      },
    });
    if (existing) {
      return fail(reply, "DUPLICATE", "您已评价过该教师，每人限评一次");
    }

    const review = await prisma.teacherReview.create({
      data: {
        ...parsed.data,
        userId: auth.sub,
        status: "PENDING",
      },
    });
    return ok(reply, { id: review.id, status: review.status }, "评价提交成功，审核后展示");
  });

  // ── 我的评价 ──
  app.get("/api/user/reviews/mine", async (request, reply) => {
    const auth = request.user as { sub: string };
    const items = await prisma.teacherReview.findMany({
      where: { userId: auth.sub },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(reply, items.map((r: any) => ({
      id: r.id,
      teacherId: r.teacherId,
      teacherName: r.teacher?.name,
      courseName: r.courseName,
      grading: r.grading,
      attendance: r.attendance,
      difficulty: r.difficulty,
      recommend: r.recommend,
      examFocus: r.examFocus,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
    })));
  });

  // ── 删除我的评价 ──
  app.delete("/api/user/reviews/:id", async (request, reply) => {
    const auth = request.user as { sub: string };
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const review = await prisma.teacherReview.findFirst({
      where: { id, userId: auth.sub },
    });
    if (!review) return fail(reply, "NOT_FOUND", "评价不存在", 404);
    await prisma.teacherReview.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });

  // ── 上传资料 ──
  app.post("/api/user/materials", async (request, reply) => {
    const auth = request.user as { sub: string };
    const parsed = submitMaterialSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "资料参数错误");

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
    });
    if (!course) return fail(reply, "NOT_FOUND", "课程不存在", 404);

    const material = await prisma.studyMaterial.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        courseId: parsed.data.courseId,
        userId: auth.sub,
        status: "PENDING",
        files: parsed.data.files.length > 0
          ? { create: parsed.data.files }
          : undefined,
      },
      include: { files: true },
    });
    return ok(reply, { id: material.id, status: material.status }, "资料提交成功，审核后展示");
  });

  // ── 我的资料 ──
  app.get("/api/user/materials/mine", async (request, reply) => {
    const auth = request.user as { sub: string };
    const items = await prisma.studyMaterial.findMany({
      where: { userId: auth.sub },
      include: {
        course: { include: { teacher: true } },
        files: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(reply, items.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      courseId: m.courseId,
      courseName: m.course?.name,
      teacherName: m.course?.teacher?.name,
      status: m.status,
      viewCount: m.viewCount,
      downloadCount: m.downloadCount,
      files: m.files,
      createdAt: m.createdAt,
    })));
  });

  // ── 删除我的资料 ──
  app.delete("/api/user/materials/:id", async (request, reply) => {
    const auth = request.user as { sub: string };
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const material = await prisma.studyMaterial.findFirst({
      where: { id, userId: auth.sub },
    });
    if (!material) return fail(reply, "NOT_FOUND", "资料不存在", 404);

    // 删除关联文件
    await prisma.materialFile.deleteMany({ where: { materialId: id } });
    await prisma.studyMaterial.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });
}
