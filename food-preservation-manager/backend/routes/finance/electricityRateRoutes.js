// backend/routes/electricityRateRoutes.js
import express from "express";
import {
 createElectricityRate,
 getElectricityRates,
 getElectricityRateById,
 updateElectricityRate,
 deleteElectricityRate
} from "../../controllers/finance/electricityRateController.js";

const router=express.Router();

router.get("/",getElectricityRates);
router.get("/:id",getElectricityRateById);
router.post("/",createElectricityRate);
router.put("/:id",updateElectricityRate);
router.delete("/:id",deleteElectricityRate);

export default router;
