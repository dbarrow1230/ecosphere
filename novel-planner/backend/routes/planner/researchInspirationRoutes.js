// backend/routes/planner/researchInspirationRoutes.js
import express from "express";
import {
 getResearchInspiration,
 getResearchInspirationById,
 saveResearchInspiration,
 updateResearchInspiration,
 archiveResearchInspiration
} from "../../controllers/planner/researchInspirationController.js";

const router=express.Router();

router.get("/",getResearchInspiration);
router.get("/:id",getResearchInspirationById);
router.post("/",saveResearchInspiration);
router.put("/:id",updateResearchInspiration);
router.patch("/:id/archive",archiveResearchInspiration);

export default router;