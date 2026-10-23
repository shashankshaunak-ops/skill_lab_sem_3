import { Types } from "mongoose";
import { z } from "zod";
import { Project } from "../models/Project.js";
import { ProjectActivity } from "../models/ProjectActivity.js";

export const statusSchema = z.enum(["idea", "forming", "in_progress", "completed"]);
export const publicUserFields = "name bio skills avatarUrl";
export class TeamError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
export function projectId(value: unknown): string {
  return z.string().regex(/^[a-f\d]{24}$/i, "The supplied identifier is invalid.").parse(value);
}
export async function getProject(id: string) {
  const project = await Project.findById(id);
  if (!project) throw new TeamError(404, "The project could not be found.");
  return project;
}
export async function requireMember(id: string, userId: string) {
  const project = await getProject(id);
  if (!project.memberIds.some((member) => member.toString() === userId)) {
    throw new TeamError(403, "Only project team members can access this discussion.");
  }
  return project;
}
export async function joinTeam(id: string, userId: string) {
  // All membership and capacity predicates are checked by MongoDB in the same write.
  const project = await Project.findOneAndUpdate({
    _id: id, ownerId: { $ne: userId }, memberIds: { $ne: userId },
    status: { $ne: "completed" },
    $expr: { $lt: [{ $size: { $ifNull: ["$memberIds", []] } }, "$maxMembers"] },
  }, { $addToSet: { memberIds: new Types.ObjectId(userId) } }, { new: true, runValidators: true });
  if (project) return project.populate("ownerId", "name");
  const current = await getProject(id);
  if (current.ownerId.toString() === userId || current.memberIds.some((member) => member.toString() === userId)) {
    throw new TeamError(409, "You already belong to this project team.");
  }
  if (current.status === "completed") throw new TeamError(409, "Completed projects cannot accept new members.");
  if (current.memberIds.length >= current.maxMembers) throw new TeamError(409, "This project team is full.");
  throw new TeamError(409, "The team changed. Refresh and try again.");
}
export async function leaveTeam(id: string, userId: string) {
  const project = await Project.findOneAndUpdate({
    _id: id, ownerId: { $ne: userId }, memberIds: userId,
  }, { $pull: { memberIds: new Types.ObjectId(userId) } }, { new: true, runValidators: true });
  if (project) return project.populate("ownerId", "name");
  const current = await getProject(id);
  if (current.ownerId.toString() === userId) throw new TeamError(403, "The project owner cannot leave their team.");
  throw new TeamError(409, "You do not belong to this project team.");
}
export async function changeStatus(id: string, userId: string, status: z.infer<typeof statusSchema>) {
  const current = await getProject(id);
  if (current.ownerId.toString() !== userId) throw new TeamError(403, "Only the project owner can update its status.");
  if (current.status === status) throw new TeamError(409, "The project already has this status.");
  if (current.status === "completed") throw new TeamError(409, "Completed projects cannot be reopened.");
  const changedAt = new Date(Math.max(Date.now(), current.statusUpdatedAt.getTime() + 1));
  // Hydrated defaults are not stored fields on older projects.
  const previousTimestamp = current.$isDefault?.("statusUpdatedAt")
    ? { $exists: false } : current.statusUpdatedAt;
  const updated = await Project.findOneAndUpdate({
    _id: id, ownerId: userId, status: current.status, statusUpdatedAt: previousTimestamp,
  }, { $set: { status, statusUpdatedAt: changedAt } }, { new: true, runValidators: true });
  if (!updated) throw new TeamError(409, "The project changed. Refresh and try again.");
  try {
    await ProjectActivity.create({ projectId: id, actorId: userId, action: "status_changed", previousStatus: current.status, newStatus: status, createdAt: changedAt });
  } catch (error) {
    // Compensate on a normal write failure without requiring replica-set transactions.
    // A process crash between writes still requires reconciliation (documented).
    const rollback = current.$isDefault?.("statusUpdatedAt")
      ? { $set: { status: current.status }, $unset: { statusUpdatedAt: "" } }
      : { $set: { status: current.status, statusUpdatedAt: current.statusUpdatedAt } };
    await Project.updateOne({ _id: id, status, statusUpdatedAt: changedAt }, rollback);
    throw error;
  }
  return Project.findById(id).populate("ownerId", "name").orFail();
}
