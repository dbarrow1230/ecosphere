// backend/routes/production/productionBatchRoutes.js
import express from "express";
import {
 createProductionBatch,
 getProductionBatches,
 getProductionBatchById,
 updateProductionBatch,
 deleteProductionBatch
} from "../../controllers/production/productionBatchController.js";

const router=express.Router();

router.post("/",createProductionBatch);
router.get("/",getProductionBatches);
router.get("/:id",getProductionBatchById);
router.put("/:id",updateProductionBatch);
router.delete("/:id",deleteProductionBatch);

export default router;