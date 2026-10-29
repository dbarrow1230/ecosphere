// backend/routes/reference/supplyCategoryRoutes.js
import express from "express";
import {
createSupplyCategory,
getSupplyCategories,
getSupplyCategoryById,
updateSupplyCategory,
deleteSupplyCategory
} from "../../controllers/reference/supplyCategoryController.js";

const router=express.Router();

router.post("/",createSupplyCategory);
router.get("/",getSupplyCategories);
router.get("/:id",getSupplyCategoryById);
router.put("/:id",updateSupplyCategory);
router.delete("/:id",deleteSupplyCategory);

export default router;