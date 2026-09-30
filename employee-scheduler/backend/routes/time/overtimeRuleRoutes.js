// backend/routes/time/overtimeRuleRoutes.js
import express from "express";
import {
 createOvertimeRule,
 getOvertimeRules,
 getOvertimeRuleById,
 updateOvertimeRule,
 deleteOvertimeRule
} from "../../controllers/time/overtimeRuleController.js";

const router=express.Router();

router.post("/",createOvertimeRule);
router.get("/",getOvertimeRules);
router.get("/:id",getOvertimeRuleById);
router.put("/:id",updateOvertimeRule);
router.delete("/:id",deleteOvertimeRule);

export default router;