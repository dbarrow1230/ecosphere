//backend/controllers/reference/propagationMethodController.js
import PropagationMethod from '../../models/reference/propagationMethodModel.js';

export const getPropagationMethods = async (req, res) => {
  const propagationMethods = await PropagationMethod.find({}).sort({ name: 1 });
  res.json(propagationMethods);
};

export const getPropagationMethodById = async (req, res) => {
  const propagationMethod = await PropagationMethod.findById(req.params.id);
  if (!propagationMethod) return res.status(404).json({ message: 'Propagation method not found' });
  res.json(propagationMethod);
};

export const createPropagationMethod = async (req, res) => {
  const propagationMethod = await PropagationMethod.create(req.body);
  res.status(201).json(propagationMethod);
};

export const updatePropagationMethod = async (req, res) => {
  const propagationMethod = await PropagationMethod.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!propagationMethod) return res.status(404).json({ message: 'Propagation method not found' });
  res.json(propagationMethod);
};

export const deletePropagationMethod = async (req, res) => {
  const propagationMethod = await PropagationMethod.findByIdAndDelete(req.params.id);
  if (!propagationMethod) return res.status(404).json({ message: 'Propagation method not found' });
  res.json({ message: 'Propagation method deleted' });
};