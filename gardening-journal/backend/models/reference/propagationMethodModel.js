//backend/models/reference/propagationMethodModel.js
import mongoose from 'mongoose';

const propagationMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  propagationType: { type: String, trim: true },
  requiresPollination: { type: Boolean, default: false },
  pollinationType: { type: String, trim: true },
  selfFertile: { type: Boolean, default: false },
  selfPollinating: { type: Boolean, default: false },
  crossPollinationRequired: { type: Boolean, default: false },
  parentPlantRequired: { type: Boolean, default: false },
  seedSavingSuitable: { type: Boolean, default: false },
  trueToType: { type: Boolean, default: false },
  description: { type: String, trim: true },
  instructions: { type: String, trim: true },
  notes: { type: String, trim: true }
}, { timestamps: true, collection: 'propagation_methods' });

const PropagationMethod = mongoose.model('PropagationMethod', propagationMethodSchema);

export default PropagationMethod;