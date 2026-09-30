//backend/routes/transfers/stockTransferLineRoutes.js
import express from "express";
import {createStockTransferLine,getStockTransferLines,getStockTransferLineById,updateStockTransferLine,deleteStockTransferLine} from "../../controllers/transfers/stockTransferLineController.js";

const router=express.Router();

router.post("/",createStockTransferLine);
router.get("/",getStockTransferLines);
router.get("/:id",getStockTransferLineById);
router.put("/:id",updateStockTransferLine);
router.delete("/:id",deleteStockTransferLine);

export default router;