import { model, Schema } from "mongoose";

const discussionMessageSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
}, { timestamps: true });
discussionMessageSchema.index({ projectId: 1, createdAt: -1, _id: -1 });
export const DiscussionMessage = model("DiscussionMessage", discussionMessageSchema);
