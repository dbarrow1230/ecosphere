// backend/routes/production/productionCostingRoutes.js
import express from "express";
import {
 createProductionCosting,
 getProductionCostings,
 getProductionCostingById,
 updateProductionCosting,
 deleteProductionCosting
} from "../../controllers/production/productionCostingController.js";

const router=express.Router();

router.post("/",createProductionCosting);
router.get("/",getProductionCostings);
router.get("/:id",getProductionCostingById);
router.put("/:id",updateProductionCosting);
router.delete("/:id",deleteProductionCosting);

export default router;