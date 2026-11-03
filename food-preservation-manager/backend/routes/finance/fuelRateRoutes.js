// backend/routes/fuelRateRoutes.js
import express from "express";
import {
 getFuelRates,
 getFuelRateById,
 createFuelRate,
 updateFuelRate,
 deleteFuelRate
} from "../../controllers/finance/fuelRateController.js";

const router=express.Router();

router.route("/")
.get(getFuelRates)
.post(createFuelRate);

router.route("/:id")
.get(getFuelRateById)
.put(updateFuelRate)
.delete(deleteFuelRate);

export default router;