// backend/routes/vendors/vendorItemPriceRoutes.js
import express from "express";
import {
 createVendorItemPrice,
 getVendorItemPrices,
 getVendorItemPriceById,
 updateVendorItemPrice,
 deleteVendorItemPrice
} from "../../controllers/vendors/vendorItemPriceController.js";

const router=express.Router();

router.post("/",createVendorItemPrice);
router.get("/",getVendorItemPrices);
router.get("/:id",getVendorItemPriceById);
router.put("/:id",updateVendorItemPrice);
router.delete("/:id",deleteVendorItemPrice);

export default router;