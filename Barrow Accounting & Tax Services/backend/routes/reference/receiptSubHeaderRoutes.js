// backend/routes/reference/receiptSubHeaderRoutes.js
import express from "express";
import {createReceiptSubHeader,getReceiptSubHeaders,getReceiptSubHeaderById,updateReceiptSubHeader,deleteReceiptSubHeader} from "../../controllers/reference/receiptSubHeaderController.js";

const router=express.Router();

router.post("/",createReceiptSubHeader);
router.get("/",getReceiptSubHeaders);
router.get("/:id",getReceiptSubHeaderById);
router.put("/:id",updateReceiptSubHeader);
router.delete("/:id",deleteReceiptSubHeader);

export default router;