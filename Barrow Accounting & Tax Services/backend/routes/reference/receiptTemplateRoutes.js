// backend/routes/reference/receiptTemplateRoutes.js
import express from "express";
import {createReceiptTemplate,getReceiptTemplates,getReceiptTemplateById,updateReceiptTemplate,deleteReceiptTemplate} from "../../controllers/reference/receiptTemplateController.js";

const router=express.Router();

router.post("/",createReceiptTemplate);
router.get("/",getReceiptTemplates);
router.get("/:id",getReceiptTemplateById);
router.put("/:id",updateReceiptTemplate);
router.delete("/:id",deleteReceiptTemplate);

export default router;