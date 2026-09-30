import express from "express";
import {
 createReadingGoal,
 getReadingGoals,
 getCurrentReadingGoal,
 getReadingGoalById,
 updateReadingGoal,
 deleteReadingGoal
} from "../controllers/ReadingGoalController.js";

const router=express.Router();

router.post("/",createReadingGoal);
router.get("/",getReadingGoals);
router.get("/current",getCurrentReadingGoal);
router.get("/:id",getReadingGoalById);
router.put("/:id",updateReadingGoal);
router.delete("/:id",deleteReadingGoal);

export default router;
