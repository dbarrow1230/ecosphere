//backend/controllers/reference/lifecycleController.js
import Lifecycle from '../../models/reference/lifecycleModel.js';

export const getLifecycles = async (req, res) => {
  const lifecycles = await Lifecycle.find({}).sort({ name: 1 });
  res.json(lifecycles);
};

export const getLifecycleById = async (req, res) => {
  const lifecycle = await Lifecycle.findById(req.params.id);
  if (!lifecycle) return res.status(404).json({ message: 'Lifecycle not found' });
  res.json(lifecycle);
};

export const createLifecycle = async (req, res) => {
  const lifecycle = await Lifecycle.create(req.body);
  res.status(201).json(lifecycle);
};

export const updateLifecycle = async (req, res) => {
  const lifecycle = await Lifecycle.findByIdAndUpdate(req.params.id, req.body, { returnDocument:"after", runValidators: true });
  if (!lifecycle) return res.status(404).json({ message: 'Lifecycle not found' });
  res.json(lifecycle);
};

export const deleteLifecycle = async (req, res) => {
  const lifecycle = await Lifecycle.findByIdAndDelete(req.params.id);
  if (!lifecycle) return res.status(404).json({ message: 'Lifecycle not found' });
  res.json({ message: 'Lifecycle deleted' });
};