//backend/models/reference/plantSpacingModel.js
import mongoose from 'mongoose';

const plantSpacingSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, unique: true },
  inches: { type: Number },
  centimeters: { type: Number },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'plant_spacings' });

const PlantSpacing = mongoose.model('PlantSpacing', plantSpacingSchema);

export default PlantSpacing;