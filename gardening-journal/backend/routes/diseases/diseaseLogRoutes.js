// backend/routes/diseases/diseaseLogRoutes.js
import express from "express";
import {
createDiseaseLog,
getDiseaseLogs,
getDiseaseLogById,
updateDiseaseLog,
addSeverityHistory,
addTreatmentToDiseaseLog,
deleteDiseaseLog
} from "../../controllers/diseases/diseaseLogController.js";

const router=express.Router();

router.post("/",createDiseaseLog);
router.get("/",getDiseaseLogs);
router.get("/:id",getDiseaseLogById);
router.put("/:id",updateDiseaseLog);
router.patch("/:id/severity",addSeverityHistory);
router.patch("/:id/treatments",addTreatmentToDiseaseLog);
router.delete("/:id",deleteDiseaseLog);

export default router;