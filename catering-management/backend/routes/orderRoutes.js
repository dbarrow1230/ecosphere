// backend/routes/orderRoutes.js
import express from "express";
import {createOrder,getOrders,getSingleOrder,updateOrder,deleteOrder} from "../controllers/orderController.js";

const router=express.Router();

router.post("/",createOrder);
router.get("/",getOrders);
router.get("/:id",getSingleOrder);
router.put("/:id",updateOrder);
router.delete("/:id",deleteOrder);

export default router;