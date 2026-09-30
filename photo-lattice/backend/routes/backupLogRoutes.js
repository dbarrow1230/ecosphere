import express from "express";
import {
 getBackupLogs,
 getBackupLogById,
 getBackupConfiguration,
 createBackup,
 createBackupLog,
 downloadBackup,
 restoreBackup,
 updateBackupLog,
 deleteBackupLog
} from "../controllers/backupLogController.js";

const router=express.Router();

router.route("/")
 .get(getBackupLogs)
 .post(createBackup);

router.post("/log",createBackupLog);

router.get("/configuration",getBackupConfiguration);

router.get("/:backupId/download",downloadBackup);
router.post("/:backupId/restore",restoreBackup);

router.route("/:id")
 .get(getBackupLogById)
 .put(updateBackupLog)
 .delete(deleteBackupLog);

export default router;
