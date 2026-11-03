import {fillMissing} from "../../services/legacyRecordFields.js";
///backend/models/growth/growthRateModel.js
import mongoose from 'mongoose';

const growthRateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'growth_rates' });

growthRateSchema.pre("init",record=>fillMissing(record,{name:record.growth_rate}));

const GrowthRate = mongoose.model('GrowthRate', growthRateSchema);

export default GrowthRate;