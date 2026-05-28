import type { FastifyInstance } from "fastify";
import { uploadToOss, getOssUrl, generateOssKey } from "./oss.js";
import { fail, ok } from "./response.js";
import { config } from "./config.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/api/upload/image", async (request, reply) => {
    const auth = request.user as { sub: string; role: string } | undefined;
    if (!auth) {
      return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    }

    const file = await request.file();
    if (!file) {
      return fail(reply, "VALIDATION_ERROR", "请选择文件");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return fail(reply, "VALIDATION_ERROR", "仅支持 JPG、PNG、GIF、WebP 格式");
    }

    const chunks: Buffer[] = [];
    for await (const chunk of file.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length > MAX_FILE_SIZE) {
      return fail(reply, "VALIDATION_ERROR", "文件大小不能超过5MB");
    }

    try {
      const { url, key } = await uploadToOss(buffer, file.filename, file.mimetype);
      return ok(reply, { url, key });
    } catch (err) {
      console.error("Upload failed:", err);
      return fail(reply, "UPLOAD_FAILED", "上传失败，请重试", 500);
    }
  });

  app.get("/api/upload/policy", async (request, reply) => {
    const auth = request.user as { sub: string; role: string } | undefined;
    if (!auth) {
      return fail(reply, "UNAUTHORIZED", "请先登录", 401);
    }

    const { bucket, region, endpoint, cdnDomain } = config.oss;
    const key = generateOssKey("upload.jpg");
    const host = cdnDomain || `${endpoint.replace("https://", `https://${bucket}.`)}`;

    return ok(reply, {
      host,
      key,
      accessKeyId: config.oss.accessKeyId,
      policy: Buffer.from(
        JSON.stringify({
          expiration: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          conditions: [
            { bucket },
            ["content-length-range", 0, MAX_FILE_SIZE],
            ["starts-with", "$key", "images/"],
            ["in", "$content-type", ALLOWED_MIME_TYPES]
          ]
        })
      ).toString("base64"),
      url: host
    });
  });
}
