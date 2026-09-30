import express from "express";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../controllers/settingsController.js";

const router = express.Router();

router.route("/")
  .get(getSettings)
  .put(updateSettings);

router.post("/reset", resetSettings);

export default router;