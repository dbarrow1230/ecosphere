// backend/routes/reference/metricUnitsRoutes.js
import express from "express";
import {createMetricUnit,getMetricUnits,getMetricUnitById,updateMetricUnit,deleteMetricUnit} from "../../controllers/reference/metricUnitsController.js";

const router=express.Router();

router.post("/",createMetricUnit);
router.get("/",getMetricUnits);
router.get("/:id",getMetricUnitById);
router.put("/:id",updateMetricUnit);
router.delete("/:id",deleteMetricUnit);

export default router;