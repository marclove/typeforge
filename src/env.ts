import { config as loadEnv } from "dotenv";

loadEnv();

function asInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const env = {
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "test" | "production",
  SERVER_PORT: asInt(process.env.SERVER_PORT || process.env.PORT, 3000),
  CLIENT_PORT: asInt(process.env.CLIENT_PORT, 5173),
};
