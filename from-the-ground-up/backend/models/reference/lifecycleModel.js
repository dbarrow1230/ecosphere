//backend/models/reference/lifecycleModel.js
import mongoose from 'mongoose';

const lifecycleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'life_cycles' });

const Lifecycle = mongoose.model('Lifecycle', lifecycleSchema);

export default Lifecycle;