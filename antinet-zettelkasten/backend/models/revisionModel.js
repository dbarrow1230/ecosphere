import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  parentModel: { type: String, required: true, trim: true },
  parentRecordId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  parentDisplayId: { type: String, default: "", trim: true },
  version: { type: Number, required: true },
  title: { type: String, default: "", trim: true },
  content: { type: String, default: "" },
  summary: { type: String, default: "", trim: true },
  changeNote: { type: String, default: "", trim: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, collection: "revisions" });

revisionSchema.index({ userId: 1, parentModel: 1, parentRecordId: 1, version: 1 }, { unique: true });

const Revision = mongoose.model("Revision", revisionSchema);

export default Revision;