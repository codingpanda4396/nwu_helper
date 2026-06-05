import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./db.js";
import { getCached } from "./cache.js";
import { fail, ok } from "./response.js";

// ── Card 函数 ──

function teacherCard(t: any) {
  return {
    id: t.id,
    name: t.name,
    college: t.college,
    department: t.department,
    avatarUrl: t.avatarUrl,
    avgGrading: t.avgGrading,
    avgAttendance: t.avgAttendance,
    avgDifficulty: t.avgDifficulty,
    avgRecommend: t.avgRecommend,
    avgExamFocus: t.avgExamFocus,
    reviewCount: t.reviewCount,
  };
}

function reviewCard(r: any) {
  return {
    id: r.id,
    teacherId: r.teacherId,
    courseName: r.courseName,
    grading: r.grading,
    attendance: r.attendance,
    difficulty: r.difficulty,
    recommend: r.recommend,
    examFocus: r.examFocus,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}

function courseCard(c: any) {
  return {
    id: c.id,
    name: c.name,
    teacherId: c.teacherId,
    teacherName: c.teacher?.name,
    teacherCollege: c.teacher?.college,
  };
}

function materialCard(m: any) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    courseId: m.courseId,
    courseName: m.course?.name,
    teacherName: m.course?.teacher?.name,
    teacherId: m.course?.teacher?.id,
    viewCount: m.viewCount,
    downloadCount: m.downloadCount,
    files: (m.files || []).map((f: any) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileSize: f.fileSize,
      mimeType: f.mimeType,
    })),
    createdAt: m.createdAt,
  };
}

// ── 查询 schemas ──

const teacherListQuery = z.object({
  keyword: z.string().optional(),
  college: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

const reviewListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

const courseListQuery = z.object({
  teacherId: z.string().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

const materialListQuery = z.object({
  courseId: z.string().optional(),
  teacherId: z.string().optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export async function academicPublicRoutes(app: FastifyInstance) {
  // ── 教师列表 ──
  app.get("/api/public/teachers", async (request, reply) => {
    const query = teacherListQuery.parse(request.query);
    const where: any = { status: "APPROVED" };
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: "insensitive" } },
        { college: { contains: query.keyword, mode: "insensitive" } },
        { department: { contains: query.keyword, mode: "insensitive" } },
      ];
    }
    if (query.college) {
      where.college = { contains: query.college, mode: "insensitive" };
    }
    const [items, total] = await prisma.$transaction([
      prisma.teacher.findMany({
        where,
        orderBy: [{ reviewCount: "desc" }, { name: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.teacher.count({ where }),
    ]);
    return ok(reply, { items: items.map(teacherCard), total, page: query.page, pageSize: query.pageSize });
  });

  // ── 教师详情 ──
  app.get("/api/public/teachers/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const teacher = await prisma.teacher.findFirst({
      where: { id, status: "APPROVED" },
    });
    if (!teacher) return fail(reply, "NOT_FOUND", "教师不存在或未审核", 404);
    return ok(reply, teacherCard(teacher));
  });

  // ── 教师评价列表 ──
  app.get("/api/public/teachers/:id/reviews", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const query = reviewListQuery.parse(request.query);

    const teacher = await prisma.teacher.findFirst({
      where: { id, status: "APPROVED" },
    });
    if (!teacher) return fail(reply, "NOT_FOUND", "教师不存在", 404);

    const [items, total] = await prisma.$transaction([
      prisma.teacherReview.findMany({
        where: { teacherId: id, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.teacherReview.count({ where: { teacherId: id, status: "APPROVED" } }),
    ]);
    return ok(reply, {
      items: items.map(reviewCard),
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  });

  // ── 课程列表 ──
  app.get("/api/public/courses", async (request, reply) => {
    const query = courseListQuery.parse(request.query);
    const where: any = {};
    if (query.teacherId) {
      where.teacherId = query.teacherId;
      // Ensure teacher is approved
      where.teacher = { status: "APPROVED" };
    }
    if (query.keyword) {
      where.name = { contains: query.keyword, mode: "insensitive" };
    }
    const [items, total] = await prisma.$transaction([
      prisma.course.findMany({
        where,
        include: { teacher: true },
        orderBy: { name: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.course.count({ where }),
    ]);
    return ok(reply, { items: items.map(courseCard), total, page: query.page, pageSize: query.pageSize });
  });

  // ── 课程详情 ──
  app.get("/api/public/courses/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const course = await prisma.course.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!course) return fail(reply, "NOT_FOUND", "课程不存在", 404);
    return ok(reply, courseCard(course));
  });

  // ── 资料列表 ──
  app.get("/api/public/materials", async (request, reply) => {
    const query = materialListQuery.parse(request.query);
    const where: any = { status: "APPROVED" };
    if (query.courseId) {
      where.courseId = query.courseId;
    }
    if (query.teacherId) {
      where.course = { teacherId: query.teacherId };
    }
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: "insensitive" } },
        { description: { contains: query.keyword, mode: "insensitive" } },
      ];
    }
    const [items, total] = await prisma.$transaction([
      prisma.studyMaterial.findMany({
        where,
        include: {
          course: { include: { teacher: true } },
          files: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.studyMaterial.count({ where }),
    ]);
    return ok(reply, { items: items.map(materialCard), total, page: query.page, pageSize: query.pageSize });
  });

  // ── 资料详情 ──
  app.get("/api/public/materials/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const material = await prisma.studyMaterial.findFirst({
      where: { id, status: "APPROVED" },
      include: {
        course: { include: { teacher: true } },
        files: true,
      },
    });
    if (!material) return fail(reply, "NOT_FOUND", "资料不存在或未审核", 404);

    // 增加浏览次数
    await prisma.studyMaterial.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return ok(reply, materialCard(material));
  });
}
