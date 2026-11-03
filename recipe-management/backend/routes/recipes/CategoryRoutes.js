// backend/routes/recipes/CategoryRoutes.js
import express from "express";
import {createCategory,getCategories,getCategoryById,updateCategory,deleteCategory} from "../../controllers/recipes/CategoryController.js";

const router=express.Router();

router.post("/",createCategory);
router.get("/",getCategories);
router.get("/:id",getCategoryById);
router.put("/:id",updateCategory);
router.delete("/:id",deleteCategory);

export default router;