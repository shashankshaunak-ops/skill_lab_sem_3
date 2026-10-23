import { model, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: "", maxlength: 500 },
    skills: { type: [String], default: [] },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform(_document, returnedObject) {
    delete returnedObject.passwordHash;
    delete returnedObject.__v;
    return returnedObject;
  },
});

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
