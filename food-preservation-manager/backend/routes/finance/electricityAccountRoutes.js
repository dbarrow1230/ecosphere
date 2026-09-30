// backend/routes/electricityAccountRoutes.js
import express from "express";
import {
 createElectricityAccount,
 getElectricityAccounts,
 getElectricityAccountDetails,
 updateElectricityAccount,
 createElectricityBill
} from "../../controllers/finance/electricityAccountController.js";

const router=express.Router();

router.get("/",getElectricityAccounts);
router.post("/",createElectricityAccount);
router.get("/:_id",getElectricityAccountDetails);
router.put("/:_id",updateElectricityAccount);
router.post("/:accountId/bills",createElectricityBill);

export default router;