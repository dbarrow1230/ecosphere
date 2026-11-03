// backend/routes/recipes/VendorCategoryRoutes.js
import express from "express";
import {createVendorCategory,getVendorCategories,getVendorCategoryById,updateVendorCategory,deleteVendorCategory} from "../../controllers/recipes/VendorCategoryController.js";

const router=express.Router();

router.post("/",createVendorCategory);
router.get("/",getVendorCategories);
router.get("/:id",getVendorCategoryById);
router.put("/:id",updateVendorCategory);
router.delete("/:id",deleteVendorCategory);

export default router;