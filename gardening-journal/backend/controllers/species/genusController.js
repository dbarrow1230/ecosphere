import mongoose from "mongoose";
import Genus from "../../models/species/genusModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createGenus = async (req, res) => {
  try {
    const { name, family, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Genus name is required" });
    }

    if (family && !isValidObjectId(family)) {
      return res.status(400).json({ message: "Invalid family id" });
    }

    const genus = new Genus({
      name: name.trim(),
      family: family || null,
      description: description || ""
    });

    const saved = await genus.save();
    const populated = await saved.populate("family");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Genus already exists" });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const getGenera = async (req, res) => {
  try {
    const query = {};

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } }
      ];
    }

    if (req.query.family && isValidObjectId(req.query.family)) {
      query.family = req.query.family;
    }

    const genera = await Genus.find(query)
      .populate("family")
      .sort({ name: 1 });

    return res.status(200).json(genera);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGenusById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid genus id" });
    }

    const genus = await Genus.findById(id).populate("family");

    if (!genus) {
      return res.status(404).json({ message: "Genus not found" });
    }

    return res.status(200).json(genus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGenus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid genus id" });
    }

    const genus = await Genus.findById(id);

    if (!genus) {
      return res.status(404).json({ message: "Genus not found" });
    }

    const { name, family, description } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Genus name cannot be empty" });
      }
      genus.name = name.trim();
    }

    if (family !== undefined) {
      if (family && !isValidObjectId(family)) {
        return res.status(400).json({ message: "Invalid family id" });
      }
      genus.family = family || null;
    }

    if (description !== undefined) {
      genus.description = description;
    }

    const updated = await genus.save();
    const populated = await updated.populate("family");

    return res.status(200).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Genus already exists" });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const deleteGenus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid genus id" });
    }

    const genus = await Genus.findByIdAndDelete(id);

    if (!genus) {
      return res.status(404).json({ message: "Genus not found" });
    }

    return res.status(200).json({ message: "Genus deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};