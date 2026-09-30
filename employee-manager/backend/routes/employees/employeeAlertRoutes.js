// backend/routes/employees/employeeAlertRoutes.js
import express from "express";
import {getEmployeeAlerts,markEmployeeAlertRead} from "../../controllers/employees/employeeAlertController.js";

const router=express.Router();

router.get("/",getEmployeeAlerts);
router.patch("/:id/read",markEmployeeAlertRead);

export default router;
