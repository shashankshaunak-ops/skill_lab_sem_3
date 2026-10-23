import { Router } from "express";
import { z } from "zod";
import { authenticate, authenticatedUserId } from "../middleware/authenticate.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { ProjectActivity } from "../models/ProjectActivity.js";
import { changeStatus, getProject, joinTeam, leaveTeam, projectId, publicUserFields, statusSchema } from "../services/team.service.js";

export const teamsRouter = Router();
teamsRouter.get("/mine", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const projects = await Project.find({ memberIds: userId }).populate("ownerId", "name").sort({ updatedAt: -1 });
  response.json({ projects });
});
teamsRouter.post("/:projectId/join", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const project = await joinTeam(projectId(request.params.projectId), userId);
  response.json({ project, message: "You joined the project team." });
});
teamsRouter.delete("/:projectId/leave", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const project = await leaveTeam(projectId(request.params.projectId), userId);
  response.json({ project, message: "You left the project team." });
});
teamsRouter.get("/:projectId/members", async (request, response) => {
  const project = await getProject(projectId(request.params.projectId));
  const members = await User.find({ _id: { $in: project.memberIds } }).select(publicUserFields).sort({ name: 1, _id: 1 });
  response.json({ members, ownerId: project.ownerId.toString(), memberCount: project.memberIds.length, maxMembers: project.maxMembers });
});
teamsRouter.patch("/:projectId/status", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const { status } = z.object({ status: statusSchema }).strict().parse(request.body);
  const project = await changeStatus(projectId(request.params.projectId), userId, status);
  response.json({ project, message: "Project status updated." });
});
teamsRouter.get("/:projectId/activity", async (request, response) => {
  const id = projectId(request.params.projectId);
  const project = await getProject(id);
  const activities = await ProjectActivity.find({ projectId: id }).populate("actorId", publicUserFields).sort({ createdAt: -1, _id: -1 }).limit(100);
  response.json({ activities, status: project.status, statusUpdatedAt: project.statusUpdatedAt });
});
