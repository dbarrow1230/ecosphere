// backend/routes/reference/diseaseRefTreatmentRoutes.js
import express from "express";
import {
createDiseaseRefTreatment,
getDiseaseRefTreatments,
getDiseaseRefTreatmentById,
updateDiseaseRefTreatment,
addDiseaseRefTreatmentNote,
deleteDiseaseRefTreatment
} from "../../controllers/reference/diseaseRefTreatmentController.js";

const router=express.Router();

router.post("/",createDiseaseRefTreatment);
router.get("/",getDiseaseRefTreatments);
router.get("/:id",getDiseaseRefTreatmentById);
router.put("/:id",updateDiseaseRefTreatment);
router.patch("/:id/notes",addDiseaseRefTreatmentNote);
router.delete("/:id",deleteDiseaseRefTreatment);

export default router;