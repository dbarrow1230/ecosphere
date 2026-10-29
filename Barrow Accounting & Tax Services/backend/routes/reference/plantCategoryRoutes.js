// backend/routes/reference/plantCategoryRoutes.js
import express from "express";
import {
createPlantCategory,
getPlantCategories,
getPlantCategoryById,
updatePlantCategory,
deletePlantCategory
} from "../../controllers/reference/plantCategoryController.js";

const router=express.Router();

router.post("/",createPlantCategory);
router.get("/",getPlantCategories);
router.get("/:id",getPlantCategoryById);
router.put("/:id",updatePlantCategory);
router.delete("/:id",deletePlantCategory);

export default router;