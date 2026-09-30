import express from "express";
import {
 createReadingPlan,
 getReadingPlans,
 getReadingPlanById,
 updateReadingPlan,
 deleteReadingPlan
} from "../controllers/ReadingPlanController.js";

const router=express.Router();

router.post("/",createReadingPlan);
router.get("/",getReadingPlans);
router.get("/:id",getReadingPlanById);
router.put("/:id",updateReadingPlan);
router.delete("/:id",deleteReadingPlan);

export default router;
