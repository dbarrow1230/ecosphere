//backend/routes/finance/paymentRoutes.js
import express from "express";
import {createPayment,getPayments,getPaymentById,updatePayment,deletePayment} from "../../controllers/finance/paymentController.js";

const router=express.Router();

router.route("/")
 .post(createPayment)
 .get(getPayments);

router.route("/:id")
 .get(getPaymentById)
 .put(updatePayment)
 .delete(deletePayment);

export default router;