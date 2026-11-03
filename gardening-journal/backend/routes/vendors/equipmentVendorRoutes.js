// backend/routes/vendors/equipmentVendorRoutes.js
import express from "express";
import {
createEquipmentVendor,
getEquipmentVendors,
getEquipmentVendorById,
updateEquipmentVendor,
deleteEquipmentVendor
} from "../../controllers/vendors/equipmentVendorController.js";

const router=express.Router();

router.post("/",createEquipmentVendor);
router.get("/",getEquipmentVendors);
router.get("/:id",getEquipmentVendorById);
router.put("/:id",updateEquipmentVendor);
router.delete("/:id",deleteEquipmentVendor);

export default router;