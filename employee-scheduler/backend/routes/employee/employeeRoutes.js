// backend/routes/employee/employeeRoutes.js
import express from "express";
import {
 createEmployee,
 getEmployees,
 getEmployeeById,
 getEmployeeByEmployeeId,
 updateEmployee,
 deleteEmployee
} from "../../controllers/employee/employeeController.js";

const router=express.Router();

router.post("/",createEmployee);
router.get("/",getEmployees);
router.get("/employee-id/:employeeId",getEmployeeByEmployeeId);
router.get("/:id",getEmployeeById);
router.put("/:id",updateEmployee);
router.delete("/:id",deleteEmployee);

export default router;