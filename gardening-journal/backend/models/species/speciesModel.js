// backend/models/species/speciesModel.js
import mongoose from "mongoose";

const speciesSchema = new mongoose.Schema(
  {
    family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", default: null },
    genus: { type: mongoose.Schema.Types.ObjectId, ref: "Genus", default: null },
    species: { type: String, trim: true, default: "" },
    botanicalName: { type: String, trim: true, default: "" },
    commonName: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    synonyms: [{ type: String, trim: true }],
    variety: [{ type: String, trim: true }]
  },
  { timestamps: true, collection: "species" }
);

const Species =
  mongoose.models.Species || mongoose.model("Species", speciesSchema);

export default Species;
