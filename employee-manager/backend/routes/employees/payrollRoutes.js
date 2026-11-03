// backend/routes/employees/payrollRoutes.js
import express from "express";
import {createPayroll,getPayrolls,updatePayroll} from "../../controllers/employees/payrollController.js";

const router=express.Router();

router.post("/",createPayroll);
router.get("/",getPayrolls);
router.put("/:id",updatePayroll);

export default router;
