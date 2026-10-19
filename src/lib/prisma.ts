import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, types } from "pg";
import { pgSslConfig, stripSslParams } from "./dbSsl";

// Fix for BigInt serialization
types.setTypeParser(20, (val) => parseInt(val, 10));

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL || "";

const pool = globalForPrisma.pool ?? new Pool({
  // TLS comes from pgSslConfig; sslmode etc. are removed from the URL so they can't override it
  connectionString: stripSslParams(connectionString),
  ssl: pgSslConfig(connectionString),
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
