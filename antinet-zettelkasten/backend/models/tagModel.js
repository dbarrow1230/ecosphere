import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  color: { type: String, default: "", trim: true },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
}, { timestamps: true, collection: "tags" });

tagSchema.index({ userId: 1, name: 1 }, { unique: true });
tagSchema.index({ userId: 1, slug: 1 }, { unique: true });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;