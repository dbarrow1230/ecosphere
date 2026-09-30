//backend/models/species/familyModel.js
import mongoose from "mongoose";

const familySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, unique: true },
    description: { type: String, trim: true, default: "" }
  },
  { timestamps: true, collection: "families" }
);

const Family = mongoose.models.Family || mongoose.model("Family", familySchema);

export default Family;