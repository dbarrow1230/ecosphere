// backend/routes/vendors/supplyVendorRoutes.js
import express from "express";
import {
createSupplyVendor,
getSupplyVendors,
getSupplyVendorById,
updateSupplyVendor,
deleteSupplyVendor
} from "../../controllers/vendors/supplyVendorController.js";

const router=express.Router();

router.post("/",createSupplyVendor);
router.get("/",getSupplyVendors);
router.get("/:id",getSupplyVendorById);
router.put("/:id",updateSupplyVendor);
router.delete("/:id",deleteSupplyVendor);

export default router;