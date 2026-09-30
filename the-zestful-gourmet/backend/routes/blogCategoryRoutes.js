import {Router} from "express";
import {createCategory,deleteCategory,getCategories,updateCategory} from "../controllers/blogCategoryController.js";
import {protect} from "../middleware/authMiddleware.js";
const router=Router();
router.get("/",getCategories);
router.post("/",protect,createCategory);
router.put("/:id",protect,updateCategory);
router.delete("/:id",protect,deleteCategory);
export default router;
