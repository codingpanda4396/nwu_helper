export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  publicWebUrl: process.env.PUBLIC_WEB_URL ?? "http://localhost:5173",
  oss: {
    region: process.env.OSS_REGION ?? "oss-cn-hangzhou",
    accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
    bucket: process.env.OSS_BUCKET ?? "nwu-helper",
    endpoint: process.env.OSS_ENDPOINT ?? "https://oss-cn-hangzhou.aliyuncs.com",
    cdnDomain: process.env.OSS_CDN_DOMAIN ?? ""
  }
};
