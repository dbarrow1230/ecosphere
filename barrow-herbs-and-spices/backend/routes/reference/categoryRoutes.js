// backend/routes/categoryRoutes.js
import express from "express";
import {createCategory,getCategories,updateCategory,deleteCategory} from "../../controllers/reference/categoryController.js";

const router=express.Router();

router.post("/",createCategory);
router.get("/",getCategories);
router.put("/:id",updateCategory);
router.delete("/:id",deleteCategory);

export default router;