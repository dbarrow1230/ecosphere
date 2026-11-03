// backend/routes/master/RecipeRoutes.js
import express from "express";
import {createRecipe,getRecipes,getRecipeById,updateRecipe,deleteRecipe} from "../../controllers/master/RecipeController.js";

const router=express.Router();

router.post("/",createRecipe);
router.get("/",getRecipes);
router.get("/:id",getRecipeById);
router.put("/:id",updateRecipe);
router.delete("/:id",deleteRecipe);

export default router;