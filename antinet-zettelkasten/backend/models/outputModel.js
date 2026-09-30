import mongoose from "mongoose";

const outputSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  outputId: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  outputType: { type: String, required: true, trim: true },
  outputTypes: [{ type: String, trim: true }],
  description: { type: String, default: "", trim: true },
  body: { type: String, default: "" },
  documentPath: { type: String, default: "", trim: true },
  zettelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zettel" }],
  sourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Source" }],
  entityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entity" }],
  structureNoteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StructureNote" }],
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "active", "published", "archived"], default: "draft", index: true },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true, collection: "outputs" });

outputSchema.index({ userId: 1, outputId: 1 }, { unique: true });
outputSchema.index({ userId: 1, projectId: 1, status: 1 });

const Output = mongoose.model("Output", outputSchema);

export default Output;
