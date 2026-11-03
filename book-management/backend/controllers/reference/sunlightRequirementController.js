//backend/controllers/reference/sunlightRequirementController.js
import SunlightRequirement from '../../models/reference/sunlightRequirementModel.js';

export const getSunlightRequirements = async (req, res) => {
  const sunlightRequirements = await SunlightRequirement.find({}).sort({ name: 1 });
  res.json(sunlightRequirements);
};

export const getSunlightRequirementById = async (req, res) => {
  const sunlightRequirement = await SunlightRequirement.findById(req.params.id);
  if (!sunlightRequirement) return res.status(404).json({ message: 'Sunlight requirement not found' });
  res.json(sunlightRequirement);
};

export const createSunlightRequirement = async (req, res) => {
  const sunlightRequirement = await SunlightRequirement.create(req.body);
  res.status(201).json(sunlightRequirement);
};

export const updateSunlightRequirement = async (req, res) => {
  const sunlightRequirement = await SunlightRequirement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!sunlightRequirement) return res.status(404).json({ message: 'Sunlight requirement not found' });
  res.json(sunlightRequirement);
};

export const deleteSunlightRequirement = async (req, res) => {
  const sunlightRequirement = await SunlightRequirement.findByIdAndDelete(req.params.id);
  if (!sunlightRequirement) return res.status(404).json({ message: 'Sunlight requirement not found' });
  res.json({ message: 'Sunlight requirement deleted' });
};