// backend/routes/payroll/payrollRoutes.js
import express from "express";
import {
 createPayroll,
 getPayrolls,
 getPayrollById,
 updatePayroll,
 deletePayroll
} from "../../controllers/payroll/payrollController.js";

const router=express.Router();

router.post("/",createPayroll);
router.get("/",getPayrolls);
router.get("/:id",getPayrollById);
router.put("/:id",updatePayroll);
router.delete("/:id",deletePayroll);

export default router;