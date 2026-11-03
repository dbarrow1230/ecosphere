// backend/routes/poetryCategoryRoutes.js
import express from "express";
import {
 getPoetryCategories,
 getPoetryCategory,
 createPoetryCategory,
 updatePoetryCategory,
 deletePoetryCategory
} from "../controllers/poetryCategoryController.js";

const router=express.Router();

router.get("/",getPoetryCategories);
router.get("/:id",getPoetryCategory);
router.post("/",createPoetryCategory);
router.put("/:id",updatePoetryCategory);
router.delete("/:id",deletePoetryCategory);

export default router;