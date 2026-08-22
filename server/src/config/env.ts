import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/cpgrams_redesign"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  JWT_SECRET: z
    .string()
    .default("cpgrams_super_secret_jwt_access_key_2026_production"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .default("cpgrams_super_secret_jwt_refresh_key_2026_production"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional().default("mock_key_for_development"),
  GOOGLE_API_KEY: z
    .string()
    .optional()
    .default(
      process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "",
    ),
  GOOGLE_CLIENT_ID: z
    .string()
    .optional()
    .default(process.env.GOOGLE_CLIENT_ID || ""),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .optional()
    .default(process.env.GOOGLE_CLIENT_SECRET || ""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .optional()
    .default(process.env.GOOGLE_CALLBACK_URL || ""),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
