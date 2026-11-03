// backend/routes/diseases/diseaseRoutes.js
import express from "express";
import {
createDisease,
getDiseases,
getDiseaseById,
updateDisease,
addDiseaseTreatment,
deleteDisease
} from "../../controllers/diseases/diseaseController.js";

const router=express.Router();

router.post("/",createDisease);
router.get("/",getDiseases);
router.get("/:id",getDiseaseById);
router.put("/:id",updateDisease);
router.patch("/:id/treatments",addDiseaseTreatment);
router.delete("/:id",deleteDisease);

export default router;