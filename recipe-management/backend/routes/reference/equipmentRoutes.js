import express from "express";
import {createEquipment,deleteEquipment,getEquipment,updateEquipment} from "../../controllers/reference/equipmentController.js";

const router=express.Router();

router.get("/",getEquipment);
router.post("/",createEquipment);
router.put("/:id",updateEquipment);
router.delete("/:id",deleteEquipment);

export default router;
