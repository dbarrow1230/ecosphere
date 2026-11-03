import mongoose from "mongoose";

const entitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  projectIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], default: [] },
  entityId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  code: { type: String, default: "", trim: true, uppercase: true },
  description: { type: String, default: "", trim: true },
  roleUse: { type: String, default: "", trim: true },
  aliases: { type: [String], default: [] },
  typeData: { type: Map, of: String, default: {} },
  relatedSourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Source" }],
  linkedZettelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zettel" }],
  linkedOutputIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Output" }],
  linkedSources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Source" }],
  linkedZettels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zettel" }],
  linkedOutputs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Output" }],
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
}, { timestamps: true, collection: "entities" });

entitySchema.index({ userId: 1, entityId: 1 }, { unique: true });
entitySchema.index({ userId: 1, projectId: 1, entityType: 1 });
entitySchema.index({ userId: 1, projectIds: 1, entityType: 1 });
entitySchema.index({ userId: 1, name: 1 });

const Entity = mongoose.model("Entity", entitySchema);

export default Entity;
