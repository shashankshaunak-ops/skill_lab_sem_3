import { model, Schema, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    tags: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    memberIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    maxMembers: { type: Number, required: true, min: 1, max: 20, default: 5 },
    status: {
      type: String,
      enum: ["idea", "forming", "in_progress", "completed"],
      default: "idea",
      required: true,
    },
    statusUpdatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

projectSchema.index({ createdAt: -1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ requiredSkills: 1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;
export const Project = model("Project", projectSchema);
