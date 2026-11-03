import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getEquipment,getEquipmentItem,createEquipment,updateEquipment,deleteEquipment} from "../../controllers/photography/equipmentController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getEquipment).post(createEquipment);
router.route("/:id").get(getEquipmentItem).put(updateEquipment).delete(deleteEquipment);
export default router;
