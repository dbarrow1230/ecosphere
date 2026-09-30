//backend/routes/receiving/goodsReceiptRoutes.js
import express from "express";
import {createGoodsReceipt,getGoodsReceipts,getGoodsReceiptById,updateGoodsReceipt,deleteGoodsReceipt,updateGoodsReceiptStatus} from "../../controllers/receiving/goodsReceiptController.js";

const router=express.Router();

router.post("/",createGoodsReceipt);
router.get("/",getGoodsReceipts);
router.get("/:id",getGoodsReceiptById);
router.put("/:id",updateGoodsReceipt);
router.patch("/:id/status",updateGoodsReceiptStatus);
router.delete("/:id",deleteGoodsReceipt);

export default router;