// backend/models/projectTypeModel.js
import mongoose from "mongoose";

const projectTypeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true, collection: "project_types" }
);

projectTypeSchema.index({ userId: 1, name: 1 }, { unique: true });
projectTypeSchema.index({ userId: 1, code: 1 }, { unique: true });

const ProjectType = mongoose.model("ProjectType", projectTypeSchema);

export default ProjectType;
