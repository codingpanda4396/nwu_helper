import OSS from "ali-oss";
import { randomUUID } from "crypto";
import { config } from "./config.js";

let ossClient: OSS | null = null;

export function getOssClient(): OSS {
  if (!ossClient) {
    const { region, accessKeyId, accessKeySecret, bucket, endpoint } = config.oss;
    if (!accessKeyId || !accessKeySecret) {
      throw new Error("OSS 凭证未配置，请在 .env 文件中设置 OSS_ACCESS_KEY_ID 和 OSS_ACCESS_KEY_SECRET");
    }
    ossClient = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
      endpoint,
      secure: true
    });
  }
  return ossClient;
}

export function generateOssKey(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `images/${date}/${randomUUID()}.${ext}`;
}

export function getOssUrl(key: string): string {
  const { cdnDomain, bucket, region, endpoint } = config.oss;
  if (cdnDomain) {
    return `${cdnDomain}/${key}`;
  }
  return `${endpoint.replace("https://", `https://${bucket}.`)}/${key}`;
}

export async function uploadToOss(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; key: string }> {
  const client = getOssClient();
  const key = generateOssKey(originalName);
  const result = await client.put(key, buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000"
    }
  });
  return {
    url: result.url,
    key
  };
}

export async function deleteFromOss(key: string): Promise<void> {
  const client = getOssClient();
  await client.delete(key);
}

export function generateStsPolicy(): object {
  const { bucket } = config.oss;
  return {
    Version: "1",
    Statement: [
      {
        Effect: "Allow",
        Action: ["oss:PutObject"],
        Resource: [`acs:oss:*:*:${bucket}/images/*`]
      }
    ]
  };
}
