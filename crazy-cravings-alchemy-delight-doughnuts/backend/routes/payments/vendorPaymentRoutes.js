// backend/routes/payments/vendorPaymentRoutes.js
import express from "express";
import {
 createVendorPayment,
 getVendorPayments,
 getVendorPaymentById,
 updateVendorPayment,
 deleteVendorPayment
} from "../../controllers/payments/vendorPaymentController.js";

const router=express.Router();

router.post("/",createVendorPayment);
router.get("/",getVendorPayments);
router.get("/:id",getVendorPaymentById);
router.put("/:id",updateVendorPayment);
router.delete("/:id",deleteVendorPayment);

export default router;