// backend/routes/reference/pestRefTreatmentRoutes.js
import express from "express";
import {
createPestRefTreatment,
getPestRefTreatments,
getPestRefTreatmentById,
updatePestRefTreatment,
addPestRefTreatmentNote,
deletePestRefTreatment
} from "../../controllers/reference/pestRefTreatmentController.js";

const router=express.Router();

router.post("/",createPestRefTreatment);
router.get("/",getPestRefTreatments);
router.get("/:id",getPestRefTreatmentById);
router.put("/:id",updatePestRefTreatment);
router.patch("/:id/notes",addPestRefTreatmentNote);
router.delete("/:id",deletePestRefTreatment);

export default router;