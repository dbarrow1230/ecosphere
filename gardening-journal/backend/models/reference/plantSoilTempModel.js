import {fillMissing} from "../../services/legacyRecordFields.js";
//backend/models/reference/plantSoilTempModel.js
import mongoose from 'mongoose';

const plantSoilTempSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, unique: true },
  fahrenheit: { type: Number },
  celsius: { type: Number },
  description: { type: String, trim: true }
}, { timestamps: true, collection: 'plant_soil_temps' });

plantSoilTempSchema.pre("init",record=>fillMissing(record,{label:record.temperature_f_min!=null?`${record.temperature_f_min}–${record.temperature_f_max} °F / ${record.temperature_c_min}–${record.temperature_c_max} °C`:undefined}));

const PlantSoilTemp = mongoose.model('PlantSoilTemp', plantSoilTempSchema);

export default PlantSoilTemp;