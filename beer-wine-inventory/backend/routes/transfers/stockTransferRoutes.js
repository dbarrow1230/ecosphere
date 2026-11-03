//backend/routes/transfers/stockTransferRoutes.js
import express from "express";
import {createStockTransfer,getStockTransfers,getStockTransferById,updateStockTransfer,deleteStockTransfer,updateStockTransferStatus} from "../../controllers/transfers/stockTransferController.js";

const router=express.Router();

router.post("/",createStockTransfer);
router.get("/",getStockTransfers);
router.get("/:id",getStockTransferById);
router.put("/:id",updateStockTransfer);
router.patch("/:id/status",updateStockTransferStatus);
router.delete("/:id",deleteStockTransfer);

export default router;