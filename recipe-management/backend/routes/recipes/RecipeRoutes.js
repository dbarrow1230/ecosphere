// backend/routes/recipes/RecipeRoutes.js
import express from "express";
import {syncRecipeNutrition,createRecipe,getRecipes,getRecipeById,updateRecipe,deleteRecipe,reserveRecipeNumber,regenerateImportRecipeNumbers} from "../../controllers/recipes/RecipeController.js";

const router=express.Router();

router.post("/",createRecipe);
router.post("/:id/nutrition-sync",syncRecipeNutrition);
router.post("/reserve-number",reserveRecipeNumber);
router.post("/regenerate-import-numbers",regenerateImportRecipeNumbers);
router.get("/",getRecipes);
router.get("/:id",getRecipeById);
router.put("/:id",updateRecipe);
router.delete("/:id",deleteRecipe);

export default router;
