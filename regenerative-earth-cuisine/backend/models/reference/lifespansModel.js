// backend/models/reference/lifespansModel.js
import mongoose from "mongoose";

const lifespanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  minMonths: { type: Number, default: null },
  maxMonths: { type: Number, default: null },
  description: { type: String, trim: true, default: "" }
}, { timestamps: true, collection: "lifespans" });

const Lifespan = mongoose.models.Lifespan || mongoose.model("Lifespan", lifespanSchema);

export default Lifespan;