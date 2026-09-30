// backend/routes/employees/weeklyScheduleRoutes.js
import express from "express";
import {createWeeklySchedule,getWeeklySchedules,updateWeeklySchedule} from "../../controllers/employees/weeklyScheduleController.js";

const router=express.Router();

router.post("/",createWeeklySchedule);
router.get("/",getWeeklySchedules);
router.put("/:id",updateWeeklySchedule);

export default router;
