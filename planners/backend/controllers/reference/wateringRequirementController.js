//backend/controllers/reference/wateringRequirementController.js
import WateringRequirement from '../../models/reference/wateringRequirementModel.js';

export const getWateringRequirements = async (req, res) => {
  try {
    const wateringRequirements = await WateringRequirement.find({}).sort({ name: 1 });
    res.json(wateringRequirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWateringRequirementById = async (req, res) => {
  try {
    const wateringRequirement = await WateringRequirement.findById(req.params.id);

    if (!wateringRequirement) {
      return res.status(404).json({ message: 'Watering requirement not found' });
    }

    res.json(wateringRequirement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWateringRequirement = async (req, res) => {
  try {
    const wateringRequirement = await WateringRequirement.create({
      name: req.body.name,
      frequency: req.body.frequency,
      description: req.body.description
    });

    res.status(201).json(wateringRequirement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateWateringRequirement = async (req, res) => {
  try {
    const wateringRequirement = await WateringRequirement.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        frequency: req.body.frequency,
        description: req.body.description
      },
      { returnDocument:"after", runValidators: true }
    );

    if (!wateringRequirement) {
      return res.status(404).json({ message: 'Watering requirement not found' });
    }

    res.json(wateringRequirement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWateringRequirement = async (req, res) => {
  try {
    const wateringRequirement = await WateringRequirement.findByIdAndDelete(req.params.id);

    if (!wateringRequirement) {
      return res.status(404).json({ message: 'Watering requirement not found' });
    }

    res.json({ message: 'Watering requirement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};