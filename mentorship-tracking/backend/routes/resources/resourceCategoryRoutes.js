// backend/routes/resources/resourceCategoryRoutes.js
import express from "express";
import {
 createResourceCategory,
 getResourceCategories,
 getResourceCategoryById,
 updateResourceCategory,
 deleteResourceCategory
} from "../../controllers/resources/resourceCategoryController.js";

const router=express.Router();

router.post("/",createResourceCategory);
router.get("/",getResourceCategories);
router.get("/:id",getResourceCategoryById);
router.put("/:id",updateResourceCategory);
router.delete("/:id",deleteResourceCategory);

export default router;