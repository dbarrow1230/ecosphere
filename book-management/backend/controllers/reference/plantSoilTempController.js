//backend/controllers/reference/plantSoilTempController.js
import PlantSoilTemp from '../../models/reference/plantSoilTempModel.js';

export const getPlantSoilTemps = async (req, res) => {
  const plantSoilTemps = await PlantSoilTemp.find({}).sort({ label: 1 });
  res.json(plantSoilTemps);
};

export const getPlantSoilTempById = async (req, res) => {
  const plantSoilTemp = await PlantSoilTemp.findById(req.params.id);
  if (!plantSoilTemp) return res.status(404).json({ message: 'Plant soil temp not found' });
  res.json(plantSoilTemp);
};

export const createPlantSoilTemp = async (req, res) => {
  const plantSoilTemp = await PlantSoilTemp.create(req.body);
  res.status(201).json(plantSoilTemp);
};

export const updatePlantSoilTemp = async (req, res) => {
  const plantSoilTemp = await PlantSoilTemp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plantSoilTemp) return res.status(404).json({ message: 'Plant soil temp not found' });
  res.json(plantSoilTemp);
};

export const deletePlantSoilTemp = async (req, res) => {
  const plantSoilTemp = await PlantSoilTemp.findByIdAndDelete(req.params.id);
  if (!plantSoilTemp) return res.status(404).json({ message: 'Plant soil temp not found' });
  res.json({ message: 'Plant soil temp deleted' });
};