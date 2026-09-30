//backend/routes/counts/stockCountRoutes.js
import express from "express";
import {createStockCount,getStockCounts,getStockCountById,updateStockCount,deleteStockCount,updateStockCountStatus} from "../../controllers/counts/stockCountController.js";

const router=express.Router();

router.post("/",createStockCount);
router.get("/",getStockCounts);
router.get("/:id",getStockCountById);
router.put("/:id",updateStockCount);
router.patch("/:id/status",updateStockCountStatus);
router.delete("/:id",deleteStockCount);

export default router;