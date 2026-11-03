// backend/routes/fuelSourceRoutes.js
import express from "express";
import {
 getFuelSources,
 getFuelSourceById,
 createFuelSource,
 updateFuelSource,
 deleteFuelSource
} from "../../controllers/finance/fuelSourceController.js";

const router=express.Router();

router.route("/")
.get(getFuelSources)
.post(createFuelSource);

router.route("/:id")
.get(getFuelSourceById)
.put(updateFuelSource)
.delete(deleteFuelSource);

export default router;
