//backend/routes/receiving/goodsReceiptLineRoutes.js
import express from "express";
import {createGoodsReceiptLine,getGoodsReceiptLines,getGoodsReceiptLineById,updateGoodsReceiptLine,deleteGoodsReceiptLine} from "../../controllers/receiving/goodsReceiptLineController.js";

const router=express.Router();

router.post("/",createGoodsReceiptLine);
router.get("/",getGoodsReceiptLines);
router.get("/:id",getGoodsReceiptLineById);
router.put("/:id",updateGoodsReceiptLine);
router.delete("/:id",deleteGoodsReceiptLine);

export default router;