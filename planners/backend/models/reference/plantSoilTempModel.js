//backend/models/reference/plantSoilTempModel.js
import mongoose from 'mongoose';

const plantSoilTempSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, unique: true },
  fahrenheit: { type: Number },
  celsius: { type: Number },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'plant_soil_temps' });

const PlantSoilTemp = mongoose.model('PlantSoilTemp', plantSoilTempSchema);

export default PlantSoilTemp;