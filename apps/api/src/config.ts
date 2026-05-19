export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  publicWebUrl: process.env.PUBLIC_WEB_URL ?? "http://localhost:5173"
};
