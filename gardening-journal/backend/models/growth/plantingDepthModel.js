import mongoose from 'mongoose';

const plantingDepthSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, unique: true },
  inches: { type: Number },
  centimeters: { type: Number },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'planting_depths' });

plantingDepthSchema.pre('save', function(next) {
  if (this.inches != null && this.centimeters == null) this.centimeters = +(this.inches * 2.54).toFixed(2);
  if (this.centimeters != null && this.inches == null) this.inches = +(this.centimeters / 2.54).toFixed(2);
  next();
});

const PlantingDepth = mongoose.model('PlantingDepth', plantingDepthSchema);

export default PlantingDepth;