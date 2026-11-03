import express from "express";
import {createOrder,deleteOrder,getOrderById,getOrders,updateOrder} from "../../controllers/operations/orderController.js";

const router=express.Router();
router.get("/",getOrders);
router.post("/",createOrder);
router.get("/:id",getOrderById);
router.put("/:id",updateOrder);
router.delete("/:id",deleteOrder);
export default router;
