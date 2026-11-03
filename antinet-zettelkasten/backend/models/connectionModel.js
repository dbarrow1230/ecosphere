import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  projectIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], default: [] },
  connectionId: { type: String, required: true, trim: true },
  fromRecordType: { type: String, required: true, trim: true },
  fromRecord: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  toRecordType: { type: String, required: true, trim: true },
  toRecord: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  relation: { type: String, required: true, trim: true },
  reason: { type: String, required: true, trim: true },
  strength: { type: String, enum: ["weak", "medium", "strong"], default: "medium" },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  fromModel: { type: String, default: "", trim: true },
  fromRecordId: { type: mongoose.Schema.Types.ObjectId, default: null },
  fromDisplayId: { type: String, default: "", trim: true },
  toModel: { type: String, default: "", trim: true },
  toRecordId: { type: mongoose.Schema.Types.ObjectId, default: null },
  toDisplayId: { type: String, default: "", trim: true },
  relationType: { type: String, default: "", trim: true },
}, { timestamps: true, collection: "connections" });

connectionSchema.index({ userId: 1, connectionId: 1 }, { unique: true });
connectionSchema.index({ userId: 1, fromRecord: 1 });
connectionSchema.index({ userId: 1, toRecord: 1 });
connectionSchema.index({ userId: 1, projectIds: 1 });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
