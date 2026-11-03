import mongoose from "mongoose";

const idSequenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recordType: { type: String, required: true, trim: true, uppercase: true },
  projectCode: { type: String, required: true, trim: true, uppercase: true },
  subtypeCode: { type: String, default: "", trim: true, uppercase: true },
  subjectCode: { type: String, default: "", trim: true, uppercase: true },
  nextNumber: { type: Number, required: true, default: 1, min: 1 },
}, { timestamps: true, collection: "id_sequences" });

idSequenceSchema.index(
  { userId: 1, recordType: 1, projectCode: 1, subtypeCode: 1, subjectCode: 1 },
  { unique: true }
);

const IdSequence = mongoose.model("IdSequence", idSequenceSchema);

export default IdSequence;