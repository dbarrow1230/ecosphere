import express from "express";
import {createAllergen,deleteAllergen,getAllergenById,getAllergens,updateAllergen} from "../../controllers/recipes/AllergenController.js";

const router=express.Router();
router.post("/",createAllergen);
router.get("/",getAllergens);
router.get("/:id",getAllergenById);
router.put("/:id",updateAllergen);
router.delete("/:id",deleteAllergen);
export default router;
