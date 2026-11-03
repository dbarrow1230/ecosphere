// backend/routes/lookups/studyCategoryRoutes.js
import express from "express";
import {
 getStudyCategories,
 getStudyCategoryById,
 createStudyCategory,
 updateStudyCategory,
 deleteStudyCategory
} from "../../controllers/lookups/studyCategoryController.js";

const router=express.Router();

router.get("/",getStudyCategories);
router.get("/:id",getStudyCategoryById);
router.post("/",createStudyCategory);
router.put("/:id",updateStudyCategory);
router.delete("/:id",deleteStudyCategory);

export default router;