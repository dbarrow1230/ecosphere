import express from "express";
import {getMentorshipTracker,saveMentorshipTracker} from "../controllers/mentorshipTrackerController.js";
const router=express.Router();
router.get("/:menteeId",getMentorshipTracker);
router.put("/:menteeId",saveMentorshipTracker);
export default router;
