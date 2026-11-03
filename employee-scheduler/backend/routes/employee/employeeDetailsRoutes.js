// backend/routes/employee/employeeDetailsRoutes.js
import express from "express";
import {
 createEmployeeDetails,
 getEmployeeDetails,
 getEmployeeDetailsById,
 getEmployeeDetailsByEmployeeId,
 updateEmployeeDetails,
 deleteEmployeeDetails
} from "../../controllers/employee/employeeDetailsController.js";

const router=express.Router();

router.post("/",createEmployeeDetails);
router.get("/",getEmployeeDetails);
router.get("/employee/:employeeId",getEmployeeDetailsByEmployeeId);
router.get("/:id",getEmployeeDetailsById);
router.put("/:id",updateEmployeeDetails);
router.delete("/:id",deleteEmployeeDetails);

export default router;