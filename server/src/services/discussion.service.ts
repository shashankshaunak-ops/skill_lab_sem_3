import { z } from "zod";
import { DiscussionMessage } from "../models/DiscussionMessage.js";
import { publicUserFields, requireMember } from "./team.service.js";

export const messageSchema = z.object({ content: z.string().trim().min(1, "Write a message before posting.").max(2000) }).strict();
export async function listMessages(projectId: string, userId: string) {
  await requireMember(projectId, userId);
  const messages = await DiscussionMessage.find({ projectId }).populate("authorId", publicUserFields)
    .sort({ createdAt: -1, _id: -1 }).limit(100);
  return messages.reverse();
}
export async function postMessage(projectId: string, userId: string, input: unknown) {
  await requireMember(projectId, userId);
  const { content } = messageSchema.parse(input);
  const message = await DiscussionMessage.create({ projectId, authorId: userId, content });
  return message.populate("authorId", publicUserFields);
}
