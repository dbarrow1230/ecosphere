import express from "express";
import {
 createHomeCategory,
 getHomeCategories,
 getHomeCategoryById,
 updateHomeCategory,
 deleteHomeCategory
} from "../../controllers/home/homeCategoryController.js";

const router=express.Router();

router.post("/",createHomeCategory);
router.get("/",getHomeCategories);
router.get("/:id",getHomeCategoryById);
router.put("/:id",updateHomeCategory);
router.delete("/:id",deleteHomeCategory);

export default router;
