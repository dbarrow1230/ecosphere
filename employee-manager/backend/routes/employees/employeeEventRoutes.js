// backend/routes/employees/employeeEventRoutes.js
import express from "express";
import {createEmployeeEvent,getEmployeeEvents,updateEmployeeEvent} from "../../controllers/employees/employeeEventController.js";

const router=express.Router();

router.post("/",createEmployeeEvent);
router.get("/",getEmployeeEvents);
router.put("/:id",updateEmployeeEvent);

export default router;
