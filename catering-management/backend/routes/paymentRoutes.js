// backend/routes/paymentRoutes.js
import express from "express";
import {createPayment,getPayments,getSinglePayment,updatePayment,deletePayment} from "../controllers/paymentController.js";

const router=express.Router();

router.post("/",createPayment);
router.get("/",getPayments);
router.get("/:id",getSinglePayment);
router.put("/:id",updatePayment);
router.delete("/:id",deletePayment);

export default router;