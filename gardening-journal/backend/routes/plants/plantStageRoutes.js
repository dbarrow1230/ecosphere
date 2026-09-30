// backend/routes/plants/plantStageRoutes.js
import express from "express";
import {
createPlantStage,
getPlantStages,
getPlantStageById,
updatePlantStage,
deletePlantStage
} from "../../controllers/plants/plantStageController.js";

const router=express.Router();

router.post("/",createPlantStage);
router.get("/",getPlantStages);
router.get("/:id",getPlantStageById);
router.put("/:id",updatePlantStage);
router.delete("/:id",deletePlantStage);

export default router;