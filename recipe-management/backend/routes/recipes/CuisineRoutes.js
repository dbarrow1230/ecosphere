// backend/routes/recipes/CuisineRoutes.js
import express from "express";
import {createCuisine,getCuisines,getCuisineById,updateCuisine,deleteCuisine} from "../../controllers/recipes/CuisineController.js";

const router=express.Router();

router.post("/",createCuisine);
router.get("/",getCuisines);
router.get("/:id",getCuisineById);
router.put("/:id",updateCuisine);
router.delete("/:id",deleteCuisine);

export default router;