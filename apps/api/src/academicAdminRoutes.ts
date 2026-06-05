import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { invalidateCache } from "./cache.js";
import { fail, ok } from "./response.js";

// ── 重算教师均分 ──

async function recalcTeacherAverages(teacherId: string) {
  const result = await prisma.teacherReview.aggregate({
    where: { teacherId, status: "APPROVED" },
    _avg: {
      grading: true,
      attendance: true,
      difficulty: true,
      recommend: true,
      examFocus: true,
    },
    _count: true,
  });
  await prisma.teacher.update({
    where: { id: teacherId },
    data: {
      avgGrading: result._avg.grading ?? 0,
      avgAttendance: result._avg.attendance ?? 0,
      avgDifficulty: result._avg.difficulty ?? 0,
      avgRecommend: result._avg.recommend ?? 0,
      avgExamFocus: result._avg.examFocus ?? 0,
      reviewCount: result._count,
    },
  });
}

// ── Zod schemas ──

const teacherUpdateSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  college: z.string().trim().max(50).optional(),
  department: z.string().trim().max(50).optional(),
  avatarUrl: z.string().nullable().optional(),
});

const courseSchema = z.object({
  name: z.string().trim().min(1).max(100),
  teacherId: z.string().min(1),
});

export async function academicAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const auth = request.user as { role: string } | undefined;
    if (!auth || auth.role !== "ADMIN") {
      return fail(reply, "FORBIDDEN", "需要管理员权限", 403);
    }
  });

  // ═══════════════════════════════════════════
  // 教师管理
  // ═══════════════════════════════════════════

  app.get("/api/admin/academic/teachers", async (request, reply) => {
    const query = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      keyword: z.string().optional(),
    }).parse(request.query);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: "insensitive" } },
        { college: { contains: query.keyword, mode: "insensitive" } },
      ];
    }

    const items = await prisma.teacher.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return ok(reply, items);
  });

  app.patch("/api/admin/academic/teachers/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = teacherUpdateSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "教师参数错误");
    const teacher = await prisma.teacher.update({ where: { id }, data: parsed.data });
    invalidateCache("teachers");
    return ok(reply, teacher);
  });

  app.patch("/api/admin/academic/teachers/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
    }).parse(request.body);
    const teacher = await prisma.teacher.update({ where: { id }, data: { status } });
    invalidateCache("teachers");
    return ok(reply, teacher);
  });

  app.delete("/api/admin/academic/teachers/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    // 级联删除关联数据
    const materialIds = (
      await prisma.studyMaterial.findMany({
        where: { course: { teacherId: id } },
        select: { id: true },
      })
    ).map((m) => m.id);
    if (materialIds.length > 0) {
      await prisma.materialFile.deleteMany({ where: { materialId: { in: materialIds } } });
      await prisma.studyMaterial.deleteMany({ where: { id: { in: materialIds } } });
    }
    await prisma.teacherReview.deleteMany({ where: { teacherId: id } });
    await prisma.course.deleteMany({ where: { teacherId: id } });
    await prisma.teacher.delete({ where: { id } });
    invalidateCache("teachers");
    return ok(reply, { deleted: true });
  });

  // ═══════════════════════════════════════════
  // 评价管理
  // ═══════════════════════════════════════════

  app.get("/api/admin/academic/reviews", async (request, reply) => {
    const query = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "HIDDEN"]).optional(),
      teacherId: z.string().optional(),
    }).parse(request.query);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.teacherId) where.teacherId = query.teacherId;

    const items = await prisma.teacherReview.findMany({
      where,
      include: { teacher: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return ok(reply, items.map((r: any) => ({
      id: r.id,
      teacherId: r.teacherId,
      teacherName: r.teacher?.name,
      userId: r.userId,
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

  app.patch("/api/admin/academic/reviews/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "HIDDEN"]),
    }).parse(request.body);

    const review = await prisma.teacherReview.update({ where: { id }, data: { status } });

    // 评价状态变更时重算教师均分
    await recalcTeacherAverages(review.teacherId);
    invalidateCache("teachers");

    return ok(reply, review);
  });

  app.delete("/api/admin/academic/reviews/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const review = await prisma.teacherReview.findUnique({ where: { id } });
    if (!review) return fail(reply, "NOT_FOUND", "评价不存在", 404);
    await prisma.teacherReview.delete({ where: { id } });
    await recalcTeacherAverages(review.teacherId);
    invalidateCache("teachers");
    return ok(reply, { deleted: true });
  });

  // ═══════════════════════════════════════════
  // 课程管理
  // ═══════════════════════════════════════════

  app.get("/api/admin/academic/courses", async (request, reply) => {
    const query = z.object({
      teacherId: z.string().optional(),
      keyword: z.string().optional(),
    }).parse(request.query);

    const where: any = {};
    if (query.teacherId) where.teacherId = query.teacherId;
    if (query.keyword) {
      where.name = { contains: query.keyword, mode: "insensitive" };
    }

    const items = await prisma.course.findMany({
      where,
      include: { teacher: true },
      orderBy: { name: "asc" },
    });
    return ok(reply, items.map((c: any) => ({
      id: c.id,
      name: c.name,
      teacherId: c.teacherId,
      teacherName: c.teacher?.name,
      materialCount: 0, // will be computed separately if needed
      createdAt: c.createdAt,
    })));
  });

  app.post("/api/admin/academic/courses", async (request, reply) => {
    const parsed = courseSchema.safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "课程参数错误");

    // 检查教师是否存在
    const teacher = await prisma.teacher.findUnique({ where: { id: parsed.data.teacherId } });
    if (!teacher) return fail(reply, "NOT_FOUND", "教师不存在", 404);

    // 检查是否已存在同名课程+教师组合
    const existing = await prisma.course.findUnique({
      where: {
        name_teacherId: {
          name: parsed.data.name,
          teacherId: parsed.data.teacherId,
        },
      },
    });
    if (existing) return fail(reply, "DUPLICATE", "该教师的此课程已存在");

    const course = await prisma.course.create({
      data: parsed.data,
      include: { teacher: true },
    });
    return ok(reply, {
      id: course.id,
      name: course.name,
      teacherId: course.teacherId,
      teacherName: course.teacher?.name,
    });
  });

  app.patch("/api/admin/academic/courses/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = courseSchema.partial().safeParse(request.body);
    if (!parsed.success) return fail(reply, "VALIDATION_ERROR", "课程参数错误");

    if (parsed.data.teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: parsed.data.teacherId } });
      if (!teacher) return fail(reply, "NOT_FOUND", "教师不存在", 404);
    }

    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
      include: { teacher: true },
    });
    return ok(reply, {
      id: course.id,
      name: course.name,
      teacherId: course.teacherId,
      teacherName: course.teacher?.name,
    });
  });

  app.delete("/api/admin/academic/courses/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    // 级联删除课程下的资料和文件
    const materialIds = (
      await prisma.studyMaterial.findMany({ where: { courseId: id }, select: { id: true } })
    ).map((m) => m.id);
    if (materialIds.length > 0) {
      await prisma.materialFile.deleteMany({ where: { materialId: { in: materialIds } } });
      await prisma.studyMaterial.deleteMany({ where: { id: { in: materialIds } } });
    }
    await prisma.course.delete({ where: { id } });
    return ok(reply, { deleted: true });
  });

  // ═══════════════════════════════════════════
  // 资料管理
  // ═══════════════════════════════════════════

  app.get("/api/admin/academic/materials", async (request, reply) => {
    const query = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "HIDDEN"]).optional(),
      courseId: z.string().optional(),
    }).parse(request.query);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.courseId) where.courseId = query.courseId;

    const items = await prisma.studyMaterial.findMany({
      where,
      include: {
        course: { include: { teacher: true } },
        files: true,
        user: { select: { id: true, name: true, nickname: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return ok(reply, items.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      courseId: m.courseId,
      courseName: m.course?.name,
      teacherName: m.course?.teacher?.name,
      userId: m.userId,
      userName: m.user?.nickname || m.user?.name,
      status: m.status,
      viewCount: m.viewCount,
      downloadCount: m.downloadCount,
      files: m.files,
      createdAt: m.createdAt,
    })));
  });

  app.patch("/api/admin/academic/materials/:id/status", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const { status } = z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "HIDDEN"]),
    }).parse(request.body);

    const material = await prisma.studyMaterial.update({ where: { id }, data: { status } });
    invalidateCache("materials");
    return ok(reply, material);
  });

  app.delete("/api/admin/academic/materials/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    await prisma.materialFile.deleteMany({ where: { materialId: id } });
    await prisma.studyMaterial.delete({ where: { id } });
    invalidateCache("materials");
    return ok(reply, { deleted: true });
  });
}
