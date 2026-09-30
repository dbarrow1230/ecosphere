//backend/controllers/growth/plantingDepthController.js
import PlantingDepth from '../../models/growth/plantingDepthModel.js';

export const getPlantingDepths = async (req, res) => {
  const plantingDepths = await PlantingDepth.find({}).sort({ label: 1 });
  res.json(plantingDepths);
};

export const getPlantingDepthById = async (req, res) => {
  const plantingDepth = await PlantingDepth.findById(req.params.id);
  if (!plantingDepth) return res.status(404).json({ message: 'Planting depth not found' });
  res.json(plantingDepth);
};

export const createPlantingDepth = async (req, res) => {
  const plantingDepth = await PlantingDepth.create(req.body);
  res.status(201).json(plantingDepth);
};

export const updatePlantingDepth = async (req, res) => {
  const plantingDepth = await PlantingDepth.findById(req.params.id);
  if (!plantingDepth) return res.status(404).json({ message: 'Planting depth not found' });

  Object.assign(plantingDepth, req.body);
  await plantingDepth.save();

  res.json(plantingDepth);
};

export const deletePlantingDepth = async (req, res) => {
  const plantingDepth = await PlantingDepth.findByIdAndDelete(req.params.id);
  if (!plantingDepth) return res.status(404).json({ message: 'Planting depth not found' });
  res.json({ message: 'Planting depth deleted' });
};