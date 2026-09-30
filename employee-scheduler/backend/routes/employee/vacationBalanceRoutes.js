// backend/routes/employee/vacationBalanceRoutes.js
import express from "express";
import {
 createVacationBalance,
 getVacationBalances,
 getVacationBalanceById,
 updateVacationBalance,
 deleteVacationBalance
} from "../../controllers/employee/vacationBalanceController.js";

const router=express.Router();

router.post("/",createVacationBalance);
router.get("/",getVacationBalances);
router.get("/:id",getVacationBalanceById);
router.put("/:id",updateVacationBalance);
router.delete("/:id",deleteVacationBalance);

export default router;