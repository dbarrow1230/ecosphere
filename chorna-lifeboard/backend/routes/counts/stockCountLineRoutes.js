//backend/routes/counts/stockCountLineRoutes.js
import express from "express";
import {createStockCountLine,getStockCountLines,getStockCountLineById,updateStockCountLine,deleteStockCountLine} from "../../controllers/counts/stockCountLineController.js";

const router=express.Router();

router.post("/",createStockCountLine);
router.get("/",getStockCountLines);
router.get("/:id",getStockCountLineById);
router.put("/:id",updateStockCountLine);
router.delete("/:id",deleteStockCountLine);

export default router;