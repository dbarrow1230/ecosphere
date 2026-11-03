// backend/routes/master/RecipeCostingRoutes.js
import express from "express";
import {createRecipeCosting,getRecipeCostings,getRecipeCostingById,updateRecipeCosting,deleteRecipeCosting} from "../../controllers/master/RecipeCostingController.js";

const router=express.Router();

router.post("/",createRecipeCosting);
router.get("/",getRecipeCostings);
router.get("/:id",getRecipeCostingById);
router.put("/:id",updateRecipeCosting);
router.delete("/:id",deleteRecipeCosting);

export default router;