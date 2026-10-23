import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    response.status(401).json({ message: "Authentication is required." });
    return;
  }

  export function authenticatedUserId(
    request: Request,
    response: Response,
  ): string | undefined {
    if (!request.userId) {
      response.status(401).json({ message: "Authentication is required." });
      return undefined;
    }
    return request.userId;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      response.status(401).json({ message: "The session token is invalid." });
      return;
    }
    request.userId = payload.sub;
    next();
  } catch {
    response.status(401).json({ message: "The session token is invalid or expired." });
  }
}
