import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { publicRoutes } from "../publicRoutes.js";
import { prisma } from "../db.js";

let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
  app = Fastify();
  await app.register(publicRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/public/banners", () => {
  it("returns an array", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/banners" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("GET /api/public/categories", () => {
  it("returns an array", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/categories" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("GET /api/public/merchants", () => {
  it("returns paginated merchants", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/merchants" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("items");
    expect(body.data).toHaveProperty("total");
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  it("supports keyword search", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/merchants?keyword=饭" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
  });
});

describe("GET /api/public/food/merchants", () => {
  it("returns food merchants", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/food/merchants" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("supports tag filter", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/food/merchants?tag=snack" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });

  it("supports sort parameter", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/food/merchants?sort=price" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });
});

describe("GET /api/public/services/categories", () => {
  it("returns service categories", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/services/categories" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("GET /api/public/community/posts", () => {
  it("returns community posts", async () => {
    const res = await app.inject({ method: "GET", url: "/api/public/community/posts" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

describe("POST /api/public/community/posts", () => {
  it("creates a post with valid data", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/public/community/posts",
      payload: {
        type: "测试",
        title: "测试帖子标题",
        content: "这是一个测试帖子的内容，至少需要五个字",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
    expect(body.data.status).toBe("PENDING");
  });

  it("rejects invalid data", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/public/community/posts",
      payload: { type: "", title: "", content: "" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/public/activity", () => {
  it("accepts valid activity data", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/public/activity",
      payload: {
        action: "page_view",
        page: "/test",
        platform: "h5",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });
});

describe("POST /api/public/feedback", () => {
  it("creates feedback with valid data", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/public/feedback",
      payload: {
        content: "这是一条测试反馈，至少需要五个字",
        type: "SUGGESTION",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("id");
  });
});
