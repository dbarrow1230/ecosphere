//backend/routes/foundation/categoryRoutes.js
import express from "express";
import {
 createCategory,
 getCategories,
 getCategoryById,
 updateCategory,
 deleteCategory,
 deactivateCategory
} from "../../controllers/foundation/categoryController.js";

const router=express.Router();

router.route("/")
 .post(createCategory)
 .get(getCategories);

router.route("/:id")
 .get(getCategoryById)
 .put(updateCategory)
 .delete(deleteCategory);

router.route("/:id/deactivate")
 .patch(deactivateCategory);

export default router;