// backend/routes/orders/purchaseOrderRoutes.js
import express from "express";
import {
 createPurchaseOrder,
 getPurchaseOrders,
 getPurchaseOrderById,
 updatePurchaseOrder,
 deletePurchaseOrder
} from "../../controllers/orders/purchaseOrderController.js";

const router=express.Router();

router.post("/",createPurchaseOrder);
router.get("/",getPurchaseOrders);
router.get("/:id",getPurchaseOrderById);
router.put("/:id",updatePurchaseOrder);
router.delete("/:id",deletePurchaseOrder);

export default router;