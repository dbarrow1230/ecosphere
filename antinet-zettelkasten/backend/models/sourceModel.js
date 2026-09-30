import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  projectIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], default: [] },
  sourceId: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  subtypeId: { type: mongoose.Schema.Types.ObjectId, ref: "RecordSubtype", required: true, index: true },
  subtype: { type: String, default: "WEB", trim: true, uppercase: true },
  author: { type: String, default: "", trim: true },
  publisher: { type: String, default: "", trim: true },
  libraryBookId: { type: String, default: "", trim: true, index: true },
  libraryBookUrl: { type: String, default: "", trim: true },
  originalUrl: { type: String, default: "", trim: true },
  filePath: { type: String, default: "", trim: true },
  accessDate: { type: Date, default: null },
  archiveType: { type: String, default: "", trim: true },
  archiveLocation: { type: String, default: "", trim: true },
  copiedText: { type: String, default: "" },
  summary: { type: String, default: "", trim: true },
  entityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entity" }],
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "active", "archived"], default: "active", index: true },
}, { timestamps: true, collection: "sources" });

sourceSchema.index({ userId: 1, sourceId: 1 }, { unique: true });
sourceSchema.index({ userId: 1, projectId: 1, status: 1 });
sourceSchema.index({ userId: 1, projectIds: 1, status: 1 });

export default mongoose.model("Source", sourceSchema);
