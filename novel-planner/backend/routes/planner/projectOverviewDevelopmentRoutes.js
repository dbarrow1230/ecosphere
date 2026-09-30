// backend/routes/planner/projectOverviewDevelopmentRoutes.js
import express from "express";
import {
 getProjectOverviewDevelopment,
 getProjectOverviewDevelopmentById,
 saveProjectOverviewDevelopment,
 updateProjectOverviewDevelopment,
 archiveProjectOverviewDevelopment
} from "../../controllers/planner/projectOverviewDevelopmentController.js";

const router=express.Router();

router.get("/",getProjectOverviewDevelopment);
router.get("/:id",getProjectOverviewDevelopmentById);
router.post("/",saveProjectOverviewDevelopment);
router.put("/:id",updateProjectOverviewDevelopment);
router.patch("/:id/archive",archiveProjectOverviewDevelopment);

export default router;