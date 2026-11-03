import mongoose from "mongoose";
import Family from "../../models/species/familyModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createFamily = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Family name is required" });
    }

    const family = new Family({
      name: name.trim(),
      description: description || ""
    });

    const saved = await family.save();

    return res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Family already exists" });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const getFamilies = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const families = await Family.find(query).sort({ name: 1 });

    return res.status(200).json(families);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid family id" });
    }

    const family = await Family.findById(id);

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    return res.status(200).json(family);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid family id" });
    }

    const { name, description } = req.body;

    const family = await Family.findById(id);

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Family name cannot be empty" });
      }
      family.name = name.trim();
    }

    if (description !== undefined) {
      family.description = description;
    }

    const updated = await family.save();

    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Family already exists" });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid family id" });
    }

    const family = await Family.findByIdAndDelete(id);

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    return res.status(200).json({ message: "Family deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};