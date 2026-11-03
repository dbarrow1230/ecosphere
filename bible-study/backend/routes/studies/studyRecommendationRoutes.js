// backend/routes/studies/studyRecommendationRoutes.js
import express from "express";
import {
 getStudyRecommendations,
 getStudyRecommendationById,
 createStudyRecommendation,
 updateStudyRecommendation,
 deleteStudyRecommendation
} from "../../controllers/studies/studyRecommendationController.js";

const router=express.Router();

router.get("/",getStudyRecommendations);
router.get("/:id",getStudyRecommendationById);
router.post("/",createStudyRecommendation);
router.put("/:id",updateStudyRecommendation);
router.delete("/:id",deleteStudyRecommendation);

export default router;