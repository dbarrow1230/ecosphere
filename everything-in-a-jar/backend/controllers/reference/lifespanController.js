// backend/controllers/reference/lifespansController.js
import Lifespan from "../../models/reference/lifespansModel.js";

// @desc Get all lifespans
// @route GET /api/lifespans
export const getLifespans = async (req, res) => {
  try {
    const lifespans = await Lifespan.find().sort({ minMonths: 1, name: 1 });
    res.status(200).json(lifespans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lifespans", error: error.message });
  }
};

// @desc Get single lifespan
// @route GET /api/lifespans/:id
export const getLifespanById = async (req, res) => {
  try {
    const lifespan = await Lifespan.findById(req.params.id);

    if (!lifespan) {
      return res.status(404).json({ message: "Lifespan not found" });
    }

    res.status(200).json(lifespan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lifespan", error: error.message });
  }
};

// @desc Create lifespan
// @route POST /api/lifespans
export const createLifespan = async (req, res) => {
  try {
    const lifespan = await Lifespan.create(req.body);
    res.status(201).json(lifespan);
  } catch (error) {
    res.status(400).json({ message: "Failed to create lifespan", error: error.message });
  }
};

// @desc Update lifespan
// @route PUT /api/lifespans/:id
export const updateLifespan = async (req, res) => {
  try {
    const lifespan = await Lifespan.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument:"after",
      runValidators: true
    });

    if (!lifespan) {
      return res.status(404).json({ message: "Lifespan not found" });
    }

    res.status(200).json(lifespan);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lifespan", error: error.message });
  }
};

// @desc Delete lifespan
// @route DELETE /api/lifespans/:id
export const deleteLifespan = async (req, res) => {
  try {
    const lifespan = await Lifespan.findByIdAndDelete(req.params.id);

    if (!lifespan) {
      return res.status(404).json({ message: "Lifespan not found" });
    }

    res.status(200).json({ message: "Lifespan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lifespan", error: error.message });
  }
};