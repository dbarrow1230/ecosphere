// backend/routes/employees/employeeRoutes.js
import express from "express";
import {archiveEmployee,createEmployee,getEmployeeById,getEmployees,updateEmployee} from "../../controllers/employees/employeeController.js";

const router=express.Router();

router.post("/",createEmployee);
router.get("/",getEmployees);
router.get("/:id",getEmployeeById);
router.put("/:id",updateEmployee);
router.patch("/:id/archive",archiveEmployee);

export default router;
