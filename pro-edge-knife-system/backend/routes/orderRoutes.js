import express from "express";
import {createOrder,deleteOrder,getDashboardSummary,getOrder,getOrders,updateOrder} from "../controllers/orderController.js";

const router=express.Router();
router.get("/dashboard-summary",getDashboardSummary);
router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrder).put(updateOrder).delete(deleteOrder);
export default router;
