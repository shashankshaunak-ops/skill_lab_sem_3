import { model, Schema } from "mongoose";

const projectActivitySchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ["status_changed"], required: true },
  previousStatus: { type: String, enum: ["idea", "forming", "in_progress", "completed"], required: true },
  newStatus: { type: String, enum: ["idea", "forming", "in_progress", "completed"], required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});
projectActivitySchema.index({ projectId: 1, createdAt: -1, _id: -1 });
export const ProjectActivity = model("ProjectActivity", projectActivitySchema);
