import { Router } from "express";
import { z } from "zod";
import { authenticate, authenticatedUserId } from "../middleware/authenticate.js";
import { User } from "../models/User.js";

export const usersRouter = Router();

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  avatarUrl: z.union([z.string().url().max(2048), z.literal("")]).optional(),
}).strict();

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

usersRouter.get("/me", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) {
    response.status(404).json({ message: "The account could not be found." });
    return;
  }
  response.json({ user });
});

usersRouter.patch("/me", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const input = profileSchema.parse(request.body);
  const update = {
    ...input,
    ...(input.skills
      ? { skills: [...new Set(input.skills.map((skill) => skill.trim()).filter(Boolean))] }
      : {}),
  };
  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    response.status(404).json({ message: "The account could not be found." });
    return;
  }
  response.json({ user });
});

usersRouter.get("/", async (request, response) => {
  const queryParams = z.object({
    skills: z.string().trim().max(400).optional(),
    q: z.string().trim().max(80).optional(),
  }).parse(request.query);
  const rawSkills = queryParams.skills
    ? queryParams.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
    : [];
  if (rawSkills.length > 10) {
    response.status(400).json({ message: "Search for no more than 10 skills at a time." });
    return;
  }
  const search = queryParams.q ?? "";
  const query = {
    ...(rawSkills.length
      ? { skills: { $in: rawSkills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) } }
      : {}),
    ...(search
      ? { $or: [{ name: new RegExp(escapeRegex(search), "i") }, { bio: new RegExp(escapeRegex(search), "i") }] }
      : {}),
  };
  const users = await User.find(query)
    .select("name email bio skills avatarUrl createdAt")
    .sort({ name: 1 })
    .limit(50);
  response.json({ users });
});

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).select(
    "name email bio skills avatarUrl createdAt",
  );
  if (!user) {
    response.status(404).json({ message: "The student profile could not be found." });
    return;
  }
  response.json({ user });
});
