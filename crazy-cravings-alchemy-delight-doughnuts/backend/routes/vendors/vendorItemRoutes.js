// backend/routes/vendors/vendorItemRoutes.js
import express from "express";
import {
 createVendorItem,
 getVendorItems,
 getVendorItemById,
 updateVendorItem,
 deleteVendorItem
} from "../../controllers/vendors/vendorItemController.js";

const router=express.Router();

router.post("/",createVendorItem);
router.get("/",getVendorItems);
router.get("/:id",getVendorItemById);
router.put("/:id",updateVendorItem);
router.delete("/:id",deleteVendorItem);

export default router;