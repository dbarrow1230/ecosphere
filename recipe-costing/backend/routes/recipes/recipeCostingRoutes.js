//backend/routes/recipes/recipeCostingRoutes.js
import express from "express";
import {
 getRecipeCostings,
 getRecipeCostingById,
 getRecipeCostingByRecipeNumber,
 createRecipeCosting,
 updateRecipeCosting,
 deleteRecipeCosting
} from "../../controllers/recipes/recipeCostingController.js";

const router=express.Router();

router.get("/",getRecipeCostings);
router.get("/recipe-number/:recipeNumber",getRecipeCostingByRecipeNumber);
router.get("/:id",getRecipeCostingById);
router.post("/",createRecipeCosting);
router.put("/:id",updateRecipeCosting);
router.delete("/:id",deleteRecipeCosting);

export default router;