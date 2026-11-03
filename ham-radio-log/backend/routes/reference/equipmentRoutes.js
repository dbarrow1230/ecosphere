// backend/routes/reference/equipmentRoutes.js
import express from "express";
import {
createEquipment,
getEquipment,
getEquipmentById,
updateEquipment,
deleteEquipment
} from "../../controllers/reference/equipmentController.js";

const router=express.Router();

router.get("/",getEquipment);
router.post("/",createEquipment);
router.get("/:id",getEquipmentById);
router.put("/:id",updateEquipment);
router.delete("/:id",deleteEquipment);

export default router;