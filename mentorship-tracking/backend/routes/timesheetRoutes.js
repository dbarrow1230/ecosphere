// backend/routes/timesheetRoutes.js
import express from "express";
import {
 createTimesheet,
 getTimesheets,
 getTimesheetById,
 getTimesheetsByMentee,
 updateTimesheet,
 deleteTimesheet
} from "../controllers/timesheetController.js";

const router=express.Router();

router.post("/create",createTimesheet);
router.get("/list",getTimesheets);
router.get("/mentee/:menteeId",getTimesheetsByMentee);
router.get("/:id",getTimesheetById);
router.put("/:id",updateTimesheet);
router.delete("/:id",deleteTimesheet);

export default router;