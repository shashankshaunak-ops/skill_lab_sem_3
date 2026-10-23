import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { authenticate, authenticatedUserId } from "../middleware/authenticate.js";
import { User } from "../models/User.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(80),
});

function createToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: "7d" });
}

authRouter.post("/register", async (request, response) => {
  const input = registrationSchema.parse(request.body);
  const email = input.email.toLowerCase();
  const existingUser = await User.exists({ email });
  if (existingUser) {
    response.status(409).json({ message: "An account with that email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email,
    passwordHash,
  });

  response.status(201).json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
    },
  });
});

authRouter.post("/login", async (request, response) => {
  const input = credentialsSchema.parse(request.body);
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    "+passwordHash",
  );
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    response.status(401).json({ message: "Email or password is incorrect." });
    return;
  }

  response.json({
    token: createToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
    },
  });
});

authRouter.get("/me", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) {
    response.status(404).json({ message: "The account could not be found." });
    return;
  }
  response.json({ user });
});
