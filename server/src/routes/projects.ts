import { Router } from "express";
import { z } from "zod";
import { authenticate, authenticatedUserId } from "../middleware/authenticate.js";
import { Project } from "../models/Project.js";

export const projectsRouter = Router();

const projectSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  requiredSkills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  maxMembers: z.number().int().min(1).max(20).default(5),
}).strict();

const projectStatuses = ["idea", "forming", "in_progress", "completed"] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

projectsRouter.get("/", async (request, response) => {
  const queryParams = z.object({
    q: z.string().trim().max(100).optional(),
    tag: z.string().trim().max(40).optional(),
    skill: z.string().trim().max(40).optional(),
    status: z.enum(projectStatuses).optional(),
  }).parse(request.query);
  const { q: search = "", tag = "", skill = "", status } = queryParams;
  const filter = {
    ...(search
      ? { $or: [{ title: new RegExp(escapeRegex(search), "i") }, { description: new RegExp(escapeRegex(search), "i") }] }
      : {}),
    ...(tag ? { tags: new RegExp(`^${escapeRegex(tag)}$`, "i") } : {}),
    ...(skill ? { requiredSkills: new RegExp(`^${escapeRegex(skill)}$`, "i") } : {}),
    ...(status ? { status } : {}),
  };
  const projects = await Project.find(filter)
    .populate("ownerId", "name")
    .sort({ createdAt: -1 })
    .limit(100);
  response.json({ projects });
});

projectsRouter.post("/", authenticate, async (request, response) => {
  const ownerId = authenticatedUserId(request, response);
  if (!ownerId) return;
  const input = projectSchema.parse(request.body);
  const project = await Project.create({
    ...input,
    tags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))],
    requiredSkills: [...new Set(input.requiredSkills.map((skill) => skill.trim()).filter(Boolean))],
    ownerId,
    memberIds: [ownerId],
    maxMembers: input.maxMembers,
    status: "idea",
    statusUpdatedAt: new Date(),
  });
  await project.populate("ownerId", "name");
  response.status(201).json({ project });
});

projectsRouter.get("/:id", async (request, response) => {
  const project = await Project.findById(request.params.id).populate("ownerId", "name");
  if (!project) {
    response.status(404).json({ message: "The project idea could not be found." });
    return;
  }
  response.json({ project });
});
