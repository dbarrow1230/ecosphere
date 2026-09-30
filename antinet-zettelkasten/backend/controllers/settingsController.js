import Settings from "../models/settingsModel.js";

export const getSettings = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    let settings = await Settings.findOne({ userId })
      .populate("defaultProjectId defaultSubtypeId");

    if (!settings) {
      settings = await Settings.create({ userId });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
      { returnDocument:"after", runValidators: true, upsert: true }
    );

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetSettings = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId || req.query.userId;

    await Settings.findOneAndDelete({ userId });

    const settings = await Settings.create({ userId });

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};