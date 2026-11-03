//backend/routes/counts/stockAdjustmentLineRoutes.js
import express from "express";
import {createStockAdjustmentLine,getStockAdjustmentLines,getStockAdjustmentLineById,updateStockAdjustmentLine,deleteStockAdjustmentLine} from "../../controllers/counts/stockAdjustmentLineController.js";

const router=express.Router();

router.post("/",createStockAdjustmentLine);
router.get("/",getStockAdjustmentLines);
router.get("/:id",getStockAdjustmentLineById);
router.put("/:id",updateStockAdjustmentLine);
router.delete("/:id",deleteStockAdjustmentLine);

export default router;