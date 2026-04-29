import path from "node:path";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

const NODE_ENV = process.env.NODE_ENV ?? "development";

config({
  path: path.resolve(process.cwd(), `.env.${NODE_ENV}`),
  override: false,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
