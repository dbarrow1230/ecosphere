///backend/models/growth/growthRateModel.js
import mongoose from 'mongoose';

const growthRateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'growth_rates' });

const GrowthRate = mongoose.model('GrowthRate', growthRateSchema);

export default GrowthRate;