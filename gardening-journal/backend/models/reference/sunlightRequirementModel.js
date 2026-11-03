//backend/models/reference/sunlightRequirementModel.js
import mongoose from 'mongoose';

const sunlightRequirementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'sunlight_requirements' });

const SunlightRequirement = mongoose.model('SunlightRequirement', sunlightRequirementSchema);

export default SunlightRequirement;