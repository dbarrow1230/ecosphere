//backend/routes/purchasing/purchaseOrderRoutes.js
import express from "express";
import {createPurchaseOrder,getPurchaseOrders,getPurchaseOrderById,updatePurchaseOrder,deletePurchaseOrder,updatePurchaseOrderStatus} from "../../controllers/purchasing/purchaseOrderController.js";

const router=express.Router();

router.post("/",createPurchaseOrder);
router.get("/",getPurchaseOrders);
router.get("/:id",getPurchaseOrderById);
router.put("/:id",updatePurchaseOrder);
router.patch("/:id/status",updatePurchaseOrderStatus);
router.delete("/:id",deletePurchaseOrder);

export default router;