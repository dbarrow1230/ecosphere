// backend/routes/reference/receiptFooterRoutes.js
import express from "express";
import {createReceiptFooter,getReceiptFooters,getReceiptFooterById,updateReceiptFooter,deleteReceiptFooter} from "../../controllers/reference/receiptFooterController.js";

const router=express.Router();

router.post("/",createReceiptFooter);
router.get("/",getReceiptFooters);
router.get("/:id",getReceiptFooterById);
router.put("/:id",updateReceiptFooter);
router.delete("/:id",deleteReceiptFooter);

export default router;