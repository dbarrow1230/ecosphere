// backend/routes/payroll/payrollPeriodRoutes.js
import express from "express";
import {
 createPayrollPeriod,
 getPayrollPeriods,
 getPayrollPeriodById,
 updatePayrollPeriod,
 deletePayrollPeriod
} from "../../controllers/payroll/payrollPeriodController.js";

const router=express.Router();

router.post("/",createPayrollPeriod);
router.get("/",getPayrollPeriods);
router.get("/:id",getPayrollPeriodById);
router.put("/:id",updatePayrollPeriod);
router.delete("/:id",deletePayrollPeriod);

export default router;