// backend/routes/product/productBatchRoutes.js
import express from "express";
import {getProductBatches,getProductBatchById,createProductBatch,updateProductBatch,deleteProductBatch} from "../../controllers/product/productBatchController.js";

const router=express.Router();

router.get("/",getProductBatches);
router.get("/:id",getProductBatchById);
router.post("/",createProductBatch);
router.put("/:id",updateProductBatch);
router.delete("/:id",deleteProductBatch);

export default router;