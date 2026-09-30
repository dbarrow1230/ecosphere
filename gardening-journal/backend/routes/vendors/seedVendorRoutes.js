// backend/routes/vendors/seedVendorRoutes.js
import express from "express";
import {
createSeedVendor,
getSeedVendors,
getSeedVendorById,
updateSeedVendor,
deleteSeedVendor
} from "../../controllers/vendors/seedVendorController.js";

const router=express.Router();

router.post("/",createSeedVendor);
router.get("/",getSeedVendors);
router.get("/:id",getSeedVendorById);
router.put("/:id",updateSeedVendor);
router.delete("/:id",deleteSeedVendor);

export default router;