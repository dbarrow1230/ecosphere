import mongoose from "mongoose";

const relationTypeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  description: { type: String, default: "", trim: true },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
}, { timestamps: true, collection: "relation_types" });

relationTypeSchema.index({ userId: 1, name: 1 }, { unique: true });
relationTypeSchema.index({ userId: 1, code: 1 }, { unique: true });

const RelationType = mongoose.model("RelationType", relationTypeSchema);

export default RelationType;