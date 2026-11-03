import express from "express";
import {createIngredient,deleteIngredient,getIngredientById,getIngredients,updateIngredient} from "../../controllers/production/ingredientController.js";

const router=express.Router();

router.post("/",createIngredient);
router.get("/",getIngredients);
router.get("/:id",getIngredientById);
router.put("/:id",updateIngredient);
router.delete("/:id",deleteIngredient);

export default router;
