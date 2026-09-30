//backend/routes/counts/stockAdjustmentRoutes.js
import express from "express";
import {createStockAdjustment,getStockAdjustments,getStockAdjustmentById,updateStockAdjustment,deleteStockAdjustment,updateStockAdjustmentStatus} from "../../controllers/counts/stockAdjustmentController.js";

const router=express.Router();

router.post("/",createStockAdjustment);
router.get("/",getStockAdjustments);
router.get("/:id",getStockAdjustmentById);
router.put("/:id",updateStockAdjustment);
router.patch("/:id/status",updateStockAdjustmentStatus);
router.delete("/:id",deleteStockAdjustment);

export default router;