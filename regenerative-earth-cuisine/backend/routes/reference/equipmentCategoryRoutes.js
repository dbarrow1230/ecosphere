// backend/routes/reference/equipmentCategoryRoutes.js
import express from "express";
import {
createEquipmentCategory,
getEquipmentCategories,
getEquipmentCategoryById,
updateEquipmentCategory,
deleteEquipmentCategory
} from "../../controllers/reference/equipmentCategoryController.js";

const router=express.Router();

router.post("/",createEquipmentCategory);
router.get("/",getEquipmentCategories);
router.get("/:id",getEquipmentCategoryById);
router.put("/:id",updateEquipmentCategory);
router.delete("/:id",deleteEquipmentCategory);

export default router;