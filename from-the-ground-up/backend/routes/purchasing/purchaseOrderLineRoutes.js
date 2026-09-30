//backend/routes/purchasing/purchaseOrderLineRoutes.js
import express from "express";
import {createPurchaseOrderLine,getPurchaseOrderLines,getPurchaseOrderLineById,updatePurchaseOrderLine,deletePurchaseOrderLine} from "../../controllers/purchasing/purchaseOrderLineController.js";

const router=express.Router();

router.post("/",createPurchaseOrderLine);
router.get("/",getPurchaseOrderLines);
router.get("/:id",getPurchaseOrderLineById);
router.put("/:id",updatePurchaseOrderLine);
router.delete("/:id",deletePurchaseOrderLine);

export default router;