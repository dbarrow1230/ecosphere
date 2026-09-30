// backend/routes/reference/vendorRoutes.js
import express from "express";
import {
 createVendor,
 deleteVendor,
 getVendorById,
 getVendors,
 updateVendor
} from "../../controllers/reference/vendorController.js";

const router=express.Router();

router.get("/",getVendors);
router.get("/:id",getVendorById);
router.post("/",createVendor);
router.put("/:id",updateVendor);
router.delete("/:id",deleteVendor);

export default router;
