import mongoose from "mongoose";

const recordSubtypeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recordType: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  description: { type: String, default: "", trim: true },
  templateFields: [{
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    inputType: { type: String, enum: ["text", "richtext", "number", "date", "select", "checkbox"], default: "text" },
    columnSpan: { type: Number, min: 1, max: 12, default: 12 },
    options: [{ type: String, trim: true }],
    placeholder: { type: String, default: "", trim: true },
    _id: false,
  }],
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
}, { timestamps: true, collection: "record_subtypes" });

recordSubtypeSchema.index({ userId: 1, recordType: 1, name: 1 }, { unique: true });
recordSubtypeSchema.index({ userId: 1, recordType: 1, code: 1 }, { unique: true });

const RecordSubtype = mongoose.model("RecordSubtype", recordSubtypeSchema);

export default RecordSubtype;
