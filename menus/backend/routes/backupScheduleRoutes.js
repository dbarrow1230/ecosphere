import express from "express";
import {
 createBackupSchedule,
 deleteBackupSchedule,
 getBackupSchedules,
 pauseBackupSchedule,
 resumeBackupSchedule,
 updateBackupSchedule
} from "../controllers/backupScheduleController.js";

const router=express.Router();

router.route("/")
 .get(getBackupSchedules)
 .post(createBackupSchedule);

router.patch("/:id/pause",pauseBackupSchedule);
router.patch("/:id/resume",resumeBackupSchedule);

router.route("/:id")
 .put(updateBackupSchedule)
 .delete(deleteBackupSchedule);

export default router;
