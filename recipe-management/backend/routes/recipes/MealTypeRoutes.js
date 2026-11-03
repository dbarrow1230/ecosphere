import express from "express";
import {createMealType,deleteMealType,getMealTypes,updateMealType} from "../../controllers/recipes/MealTypeController.js";

const router=express.Router();
router.get("/",getMealTypes);
router.post("/",createMealType);
router.put("/:id",updateMealType);
router.delete("/:id",deleteMealType);
export default router;
