//backend/controllers/reference/plantSpacingController.js
import PlantSpacing from '../../models/reference/plantSpacingModel.js';

export const getPlantSpacings = async (req, res) => {
  const plantSpacings = await PlantSpacing.find({}).sort({ label: 1 });
  res.json(plantSpacings);
};

export const getPlantSpacingById = async (req, res) => {
  const plantSpacing = await PlantSpacing.findById(req.params.id);
  if (!plantSpacing) return res.status(404).json({ message: 'Plant spacing not found' });
  res.json(plantSpacing);
};

export const createPlantSpacing = async (req, res) => {
  const plantSpacing = await PlantSpacing.create(req.body);
  res.status(201).json(plantSpacing);
};

export const updatePlantSpacing = async (req, res) => {
  const plantSpacing = await PlantSpacing.findByIdAndUpdate(req.params.id, req.body, { returnDocument:"after", runValidators: true });
  if (!plantSpacing) return res.status(404).json({ message: 'Plant spacing not found' });
  res.json(plantSpacing);
};

export const deletePlantSpacing = async (req, res) => {
  const plantSpacing = await PlantSpacing.findByIdAndDelete(req.params.id);
  if (!plantSpacing) return res.status(404).json({ message: 'Plant spacing not found' });
  res.json({ message: 'Plant spacing deleted' });
};