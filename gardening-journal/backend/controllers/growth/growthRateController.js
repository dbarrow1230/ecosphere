//backend/controllers/growth/growthRateController.js
import GrowthRate from '../../models/growth/growthRateModel.js';

export const getGrowthRates = async (req, res) => {
  const growthRates = await GrowthRate.find({}).sort({ name: 1 });
  res.json(growthRates);
};

export const getGrowthRateById = async (req, res) => {
  const growthRate = await GrowthRate.findById(req.params.id);
  if (!growthRate) return res.status(404).json({ message: 'Growth rate not found' });
  res.json(growthRate);
};

export const createGrowthRate = async (req, res) => {
  const growthRate = await GrowthRate.create(req.body);
  res.status(201).json(growthRate);
};

export const updateGrowthRate = async (req, res) => {
  const growthRate = await GrowthRate.findByIdAndUpdate(req.params.id, req.body, { returnDocument:"after", runValidators: true });
  if (!growthRate) return res.status(404).json({ message: 'Growth rate not found' });
  res.json(growthRate);
};

export const deleteGrowthRate = async (req, res) => {
  const growthRate = await GrowthRate.findByIdAndDelete(req.params.id);
  if (!growthRate) return res.status(404).json({ message: 'Growth rate not found' });
  res.json({ message: 'Growth rate deleted' });
};