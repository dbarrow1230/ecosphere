import mongoose from "mongoose";

const structureNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain", default: null, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  projectIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], default: [] },
  structureNoteId: { type: String, required: true, trim: true },
  subtype: { type: String, required: true, trim: true, uppercase: true },
  title: { type: String, required: true, trim: true },
  purpose: { type: String, default: "", trim: true },
  summary: { type: String, default: "", trim: true },
  zettelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Zettel" }],
  pathEntries: [{
    zettelId: { type: mongoose.Schema.Types.ObjectId, ref: "Zettel", required: true },
    annotation: { type: String, default: "", trim: true },
    _id: false,
  }],
  sourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Source" }],
  entityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entity" }],
  orderEntries: [{
    recordType: { type: String, enum: ["zettel", "source", "entity"], required: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
    _id: false,
  }],
  outline: { type: String, default: "" },
  writingDraft: {
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    savedAt: { type: Date, default: null },
  },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["draft", "active", "reviewed", "archived"], default: "draft", index: true },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true, collection: "structure_notes" });

structureNoteSchema.index({ userId: 1, structureNoteId: 1 }, { unique: true });
structureNoteSchema.index({ userId: 1, projectId: 1, status: 1 });
structureNoteSchema.index({ userId: 1, projectIds: 1, status: 1 });

const StructureNote = mongoose.model("StructureNote", structureNoteSchema);

export default StructureNote;
