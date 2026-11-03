// backend/routes/orders/orderRoutes.js
import express from "express";
import {
 createOrder,
 getOrders,
 getOrderById,
 updateOrder,
 deleteOrder
} from "../../controllers/orders/orderController.js";

const router=express.Router();

router.post("/",createOrder);
router.get("/",getOrders);
router.get("/:id",getOrderById);
router.put("/:id",updateOrder);
router.delete("/:id",deleteOrder);

export default router;