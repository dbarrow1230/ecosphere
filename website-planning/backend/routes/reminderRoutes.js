import express from "express";
import {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  dismissReminder,
  archiveReminder,
  pauseReminder,
  resumeReminder,
  deleteReminder,
} from "../controllers/reminderController.js";

const router = express.Router();

router.route("/")
  .get(getReminders)
  .post(createReminder);

router.route("/:id")
  .get(getReminderById)
  .put(updateReminder)
  .delete(deleteReminder);

router.patch("/:id/dismiss", dismissReminder);
router.patch("/:id/archive", archiveReminder);
router.patch("/:id/pause",pauseReminder);
router.patch("/:id/resume",resumeReminder);

export default router;
