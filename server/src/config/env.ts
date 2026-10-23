import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config();
dotenv.config({ path: resolve(process.cwd(), "..", ".env") });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};

if (env.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}
