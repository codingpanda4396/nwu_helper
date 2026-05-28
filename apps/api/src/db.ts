import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL || "postgresql://nwu:nwu_password@localhost:5432/nwu_helper";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}connection_limit=20&pool_timeout=10&connect_timeout=5`
    }
  },
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
