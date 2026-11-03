// backend/models/projectModel.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  projectId: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectType", required: true, index: true },
  description: { type: String, default: "", trim: true },
  status: { type: String, enum: ["active", "paused", "archived"], default: "active", index: true },
  tags: { type: [String], default: [] },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true, collection: "projects" });

projectSchema.index({ userId: 1, projectId: 1 }, { unique: true });
projectSchema.index({ userId: 1, code: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;