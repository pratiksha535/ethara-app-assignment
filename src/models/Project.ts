import mongoose, { Schema, Model } from "mongoose";
import { IProject } from "@/types";

const MemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [MemberSchema],
  },
  { timestamps: true }
);

ProjectSchema.index({ "members.user": 1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
export default Project;
