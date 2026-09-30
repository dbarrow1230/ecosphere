// backend/routes/plants/plantVarietyRoutes.js
import express from "express";
import {
createPlantVariety,
getPlantVarieties,
getPlantVarietyById,
updatePlantVariety,
deletePlantVariety
} from "../../controllers/plants/plantVarietyController.js";

const router=express.Router();

router.post("/",createPlantVariety);
router.get("/",getPlantVarieties);
router.get("/:id",getPlantVarietyById);
router.put("/:id",updatePlantVariety);
router.delete("/:id",deletePlantVariety);

export default router;