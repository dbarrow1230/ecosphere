// backend/routes/smartGoalRoutes.js
import express from "express";
import {
 createSmartGoal,
 getSmartGoals,
 getSmartGoalById,
 getSmartGoalsByMentee,
 updateSmartGoal,
 deleteSmartGoal
} from "../controllers/smartGoalController.js";

const router=express.Router();

router.post("/create",createSmartGoal);
router.get("/list",getSmartGoals);
router.get("/mentee/:menteeId",getSmartGoalsByMentee);
router.get("/:id",getSmartGoalById);
router.put("/:id",updateSmartGoal);
router.delete("/:id",deleteSmartGoal);

export default router;