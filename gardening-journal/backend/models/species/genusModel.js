//backend/models/species/genusModel.js
import mongoose from "mongoose";

const genusSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, unique: true },
    family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", default: null },
    description: { type: String, trim: true, default: "" }
  },
  { timestamps: true, collection: "genus" }
);

const Genus = mongoose.models.Genus || mongoose.model("Genus", genusSchema);

export default Genus;