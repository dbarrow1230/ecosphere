import express from "express";
import {createProductionBatch,deleteProductionBatch,getProductionBatchById,getProductionBatches,updateProductionBatch,updateProductionBatchStatus} from "../../controllers/production/productionBatchController.js";

const router=express.Router();

router.post("/",createProductionBatch);
router.get("/",getProductionBatches);
router.get("/:id",getProductionBatchById);
router.put("/:id",updateProductionBatch);
router.patch("/:id/status",updateProductionBatchStatus);
router.delete("/:id",deleteProductionBatch);

export default router;
