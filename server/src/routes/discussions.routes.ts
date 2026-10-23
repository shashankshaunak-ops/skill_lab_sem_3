import { Router } from "express";
import { authenticate, authenticatedUserId } from "../middleware/authenticate.js";
import { listMessages, postMessage } from "../services/discussion.service.js";
import { projectId } from "../services/team.service.js";

export const discussionsRouter = Router();
discussionsRouter.get("/:projectId/messages", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const messages = await listMessages(projectId(request.params.projectId), userId);
  response.json({ messages });
});
discussionsRouter.post("/:projectId/messages", authenticate, async (request, response) => {
  const userId = authenticatedUserId(request, response);
  if (!userId) return;
  const message = await postMessage(projectId(request.params.projectId), userId, request.body);
  response.status(201).json({ message });
});
