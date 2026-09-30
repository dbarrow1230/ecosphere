import express from "express";
import {createTimeClockEntry,deleteTimeClockEntry,getTimeClockEntries,getTimeClockStatus,punchTimeClock,updateTimeClockEntry} from "../../controllers/employees/timeClockController.js";

const router=express.Router();

router.post("/punch",punchTimeClock);
router.get("/status/:employeeNumber",getTimeClockStatus);
router.post("/",createTimeClockEntry);
router.get("/",getTimeClockEntries);
router.put("/:id",updateTimeClockEntry);
router.delete("/:id",deleteTimeClockEntry);

export default router;
