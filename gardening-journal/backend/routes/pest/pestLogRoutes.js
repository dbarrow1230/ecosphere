// backend/routes/pests/pestLogRoutes.js
import express from "express";
import {
createPestLog,
getPestLogs,
getPestLogById,
updatePestLog,
addSeverityHistoryToPestLog,
addTreatmentToPestLog,
addPestLogNote,
deletePestLog
} from "../../controllers/pests/pestLogController.js";

const router=express.Router();

router.post("/",createPestLog);
router.get("/",getPestLogs);
router.get("/:id",getPestLogById);
router.put("/:id",updatePestLog);
router.patch("/:id/severity",addSeverityHistoryToPestLog);
router.patch("/:id/treatments",addTreatmentToPestLog);
router.patch("/:id/notes",addPestLogNote);
router.delete("/:id",deletePestLog);

export default router;