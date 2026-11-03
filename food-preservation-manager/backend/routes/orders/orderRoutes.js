import express from "express";
import {createOrder,deleteOrder,getOrderById,getOrders,updateOrder} from "../../controllers/orders/orderController.js";

const router=express.Router();

router.get("/",getOrders);
router.get("/:id",getOrderById);
router.post("/",createOrder);
router.put("/:id",updateOrder);
router.delete("/:id",deleteOrder);

export default router;
