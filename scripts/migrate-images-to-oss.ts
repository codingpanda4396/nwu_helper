import { PrismaClient } from "@prisma/client";
import OSS from "ali-oss";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const ossClient = new OSS({
  region: process.env.OSS_REGION || "oss-cn-hangzhou",
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "",
  bucket: process.env.OSS_BUCKET || "nwu-helper",
  endpoint: process.env.OSS_ENDPOINT || "https://oss-cn-hangzhou.aliyuncs.com",
  secure: true
});

const cdnDomain = process.env.OSS_CDN_DOMAIN || "";

function getOssUrl(key: string): string {
  if (cdnDomain) {
    return `${cdnDomain}/${key}`;
  }
  const bucket = process.env.OSS_BUCKET || "nwu-helper";
  const endpoint = process.env.OSS_ENDPOINT || "https://oss-cn-hangzhou.aliyuncs.com";
  return `${endpoint.replace("https://", `https://${bucket}.`)}/${key}`;
}

async function uploadLocalImage(localPath: string): Promise<string | null> {
  const fullPath = join(process.cwd(), "apps/student/static", localPath);
  if (!existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return null;
  }

  try {
    const buffer = readFileSync(fullPath);
    const ext = localPath.split(".").pop()?.toLowerCase() || "jpg";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const key = `images/migrated/${date}/${Date.now()}.${ext}`;

    await ossClient.put(key, buffer, {
      headers: {
        "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
        "Cache-Control": "public, max-age=31536000"
      }
    });

    return getOssUrl(key);
  } catch (err) {
    console.error(`Failed to upload ${localPath}:`, err);
    return null;
  }
}

async function migrateTable(tableName: string, idField: string, imageFields: string[]) {
  console.log(`\nMigrating ${tableName}...`);

  const records = await (prisma as any)[tableName].findMany();
  console.log(`Found ${records.length} records`);

  for (const record of records) {
    const updates: Record<string, string> = {};
    let hasUpdates = false;

    for (const field of imageFields) {
      const currentValue = record[field];
      if (!currentValue || currentValue.startsWith("http")) {
        continue;
      }

      if (currentValue.startsWith("/assets/images/")) {
        const newUrl = await uploadLocalImage(currentValue);
        if (newUrl) {
          updates[field] = newUrl;
          hasUpdates = true;
          console.log(`  ${record[idField]}.${field}: ${currentValue} -> ${newUrl}`);
        }
      }
    }

    if (hasUpdates) {
      await (prisma as any)[tableName].update({
        where: { id: record[idField] },
        data: updates
      });
    }
  }
}

async function main() {
  console.log("Starting image migration to OSS...");
  console.log("Make sure OSS credentials are set in environment variables.\n");

  try {
    await migrateTable("merchant", "id", ["coverImageUrl", "qrImageUrl"]);
    await migrateTable("banner", "id", ["imageUrl"]);
    await migrateTable("activity", "id", ["coverImage"]);
    await migrateTable("wechatEntryConfig", "id", ["imageUrl"]);

    console.log("\nMigration completed!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
