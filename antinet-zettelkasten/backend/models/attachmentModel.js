import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  attachmentId: { type: String, required: true, trim: true },
  parentModel: { type: String, required: true, trim: true },
  parentRecordId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  parentDisplayId: { type: String, default: "", trim: true },
  fileName: { type: String, required: true, trim: true },
  originalName: { type: String, default: "", trim: true },
  filePath: { type: String, required: true, trim: true },
  fileType: { type: String, default: "", trim: true },
  mimeType: { type: String, default: "", trim: true },
  size: { type: Number, default: 0 },
  description: { type: String, default: "", trim: true },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
}, { timestamps: true , collection: "attachments" });

attachmentSchema.index({ userId: 1, attachmentId: 1 }, { unique: true });
attachmentSchema.index({ userId: 1, parentModel: 1, parentRecordId: 1 });

const Attachment = mongoose.model("Attachment", attachmentSchema);

export default Attachment;
