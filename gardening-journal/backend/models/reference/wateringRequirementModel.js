import mongoose from 'mongoose';

const wateringRequirementSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  frequency: { type: String, trim: true, default: "" },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'watering_requirements' });

const WateringRequirement = mongoose.model('WateringRequirement', wateringRequirementSchema);

export default WateringRequirement;