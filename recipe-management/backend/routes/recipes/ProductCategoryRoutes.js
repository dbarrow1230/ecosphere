// backend/routes/recipes/ProductCategoryRoutes.js
import express from "express";
import {createProductCategory,getProductCategories,getProductCategoryById,updateProductCategory,deleteProductCategory} from "../../controllers/recipes/ProductCategoryController.js";

const router=express.Router();

router.post("/",createProductCategory);
router.get("/",getProductCategories);
router.get("/:id",getProductCategoryById);
router.put("/:id",updateProductCategory);
router.delete("/:id",deleteProductCategory);

export default router;