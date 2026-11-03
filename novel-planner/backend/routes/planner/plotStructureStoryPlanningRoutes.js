// backend/routes/planner/plotStructureStoryPlanningRoutes.js
import express from "express";
import {
 getPlotStructureStoryPlanning,
 getPlotStructureStoryPlanningById,
 savePlotStructureStoryPlanning,
 updatePlotStructureStoryPlanning,
 archivePlotStructureStoryPlanning
} from "../../controllers/planner/plotStructureStoryPlanningController.js";

const router=express.Router();

router.get("/",getPlotStructureStoryPlanning);
router.get("/:id",getPlotStructureStoryPlanningById);
router.post("/",savePlotStructureStoryPlanning);
router.put("/:id",updatePlotStructureStoryPlanning);
router.patch("/:id/archive",archivePlotStructureStoryPlanning);

export default router;