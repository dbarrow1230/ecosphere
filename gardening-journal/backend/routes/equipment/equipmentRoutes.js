// backend/routes/equipment/equipmentRoutes.js
import express from "express";
import {
createEquipment,
getEquipment,
getEquipmentById,
updateEquipment,
addMaintenanceRecord,
deleteEquipment
} from "../../controllers/equipment/equipmentController.js";

const router=express.Router();

router.post("/",createEquipment);
router.get("/",getEquipment);
router.get("/:id",getEquipmentById);
router.put("/:id",updateEquipment);
router.patch("/:id/maintenance",addMaintenanceRecord);
router.delete("/:id",deleteEquipment);

export default router;