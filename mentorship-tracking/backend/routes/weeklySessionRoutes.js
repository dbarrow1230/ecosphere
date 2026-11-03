// backend/routes/weeklySessionRoutes.js
import express from "express";
import {
 createWeeklySession,
 getWeeklySessions,
 getWeeklySessionById,
 getWeeklySessionsByMentee,
 updateWeeklySession,
 deleteWeeklySession
} from "../controllers/weeklySessionController.js";

const router=express.Router();

router.post("/create",createWeeklySession);
router.get("/list",getWeeklySessions);
router.get("/mentee/:menteeId",getWeeklySessionsByMentee);
router.get("/:id",getWeeklySessionById);
router.put("/:id",updateWeeklySession);
router.delete("/:id",deleteWeeklySession);

export default router;