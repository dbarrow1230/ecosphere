// backend/routes/lookups/translationRoutes.js
import express from "express";
import {
 getTranslations,
 getTranslationById,
 getNextTranslationSortOrder,
 createTranslation,
 updateTranslation,
 deleteTranslation
} from "../../controllers/lookups/translationController.js";

const router=express.Router();

router.get("/next-sort",getNextTranslationSortOrder);
router.get("/",getTranslations);
router.get("/:id",getTranslationById);
router.post("/",createTranslation);
router.put("/:id",updateTranslation);
router.delete("/:id",deleteTranslation);

export default router;