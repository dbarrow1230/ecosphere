// backend/routes/planner/writingProgressProductivityRoutes.js
import express from "express";
import {
 getWritingProgressProductivity,
 getWritingProgressProductivityById,
 saveWritingProgressProductivity,
 updateWritingProgressProductivity,
 archiveWritingProgressProductivity
} from "../../controllers/planner/writingProgressProductivityController.js";

const router=express.Router();

router.get("/",getWritingProgressProductivity);
router.get("/:id",getWritingProgressProductivityById);
router.post("/",saveWritingProgressProductivity);
router.put("/:id",updateWritingProgressProductivity);
router.patch("/:id/archive",archiveWritingProgressProductivity);

export default router;