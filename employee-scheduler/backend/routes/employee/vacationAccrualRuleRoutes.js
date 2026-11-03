// backend/routes/employee/vacationAccrualRuleRoutes.js
import express from "express";
import {
 createVacationAccrualRule,
 getVacationAccrualRules,
 getVacationAccrualRuleById,
 updateVacationAccrualRule,
 deleteVacationAccrualRule
} from "../../controllers/employee/vacationAccrualRuleController.js";

const router=express.Router();

router.post("/",createVacationAccrualRule);
router.get("/",getVacationAccrualRules);
router.get("/:id",getVacationAccrualRuleById);
router.put("/:id",updateVacationAccrualRule);
router.delete("/:id",deleteVacationAccrualRule);

export default router;