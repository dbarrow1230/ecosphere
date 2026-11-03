// backend/routes/vendors/vendorRoutes.js
import express from "express";
import {
 createVendor,
 getVendors,
 getVendorById,
 updateVendor,
 deleteVendor
} from "../../controllers/vendors/vendorController.js";

const router=express.Router();

router.post("/",createVendor);
router.get("/",getVendors);
router.get("/:id",getVendorById);
router.put("/:id",updateVendor);
router.delete("/:id",deleteVendor);

export default router;