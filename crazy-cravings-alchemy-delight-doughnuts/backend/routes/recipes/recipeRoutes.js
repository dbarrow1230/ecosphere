// backend/routes/recipes/recipeRoutes.js
import express from "express";
import {
 createRecipe,
 getRecipes,
 getRecipeById,
 updateRecipe,
 deleteRecipe
} from "../../controllers/recipes/recipeController.js";

const router=express.Router();

router.post("/",createRecipe);
router.get("/",getRecipes);
router.get("/:id",getRecipeById);
router.put("/:id",updateRecipe);
router.delete("/:id",deleteRecipe);

export default router;