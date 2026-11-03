// backend/routes/methods/bibleStudyMethodRoutes.js
import express from "express";
import {
 getBibleStudyMethods,
 getBibleStudyMethodById,
 getBibleStudyMethodBySlug,
 createBibleStudyMethod,
 updateBibleStudyMethod,
 deleteBibleStudyMethod
} from "../../controllers/methods/bibleStudyMethodController.js";

const router=express.Router();

router.get("/",getBibleStudyMethods);
router.get("/slug/:slug",getBibleStudyMethodBySlug);
router.get("/:id",getBibleStudyMethodById);
router.post("/",createBibleStudyMethod);
router.put("/:id",updateBibleStudyMethod);
router.delete("/:id",deleteBibleStudyMethod);

export default router;