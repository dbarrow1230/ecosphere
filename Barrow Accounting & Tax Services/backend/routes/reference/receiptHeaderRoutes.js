// backend/routes/reference/receiptHeaderRoutes.js
import express from "express";
import {createReceiptHeader,getReceiptHeaders,getReceiptHeaderById,updateReceiptHeader,deleteReceiptHeader} from "../../controllers/reference/receiptHeaderController.js";

const router=express.Router();

router.post("/",createReceiptHeader);
router.get("/",getReceiptHeaders);
router.get("/:id",getReceiptHeaderById);
router.put("/:id",updateReceiptHeader);
router.delete("/:id",deleteReceiptHeader);

export default router;