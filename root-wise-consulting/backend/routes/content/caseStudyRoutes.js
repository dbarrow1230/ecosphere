//backend/routes/content/caseStudyRoutes.js
import express from "express";
import{
 createCaseStudy,
 getCaseStudies,
 getCaseStudyById,
 updateCaseStudy,
 deleteCaseStudy,
 toggleCaseStudyStatus
}from "../../controllers/content/caseStudyController.js";

const router=express.Router();

router.post("/",createCaseStudy);
router.get("/",getCaseStudies);
router.get("/:id",getCaseStudyById);
router.put("/:id",updateCaseStudy);
router.patch("/:id/toggle-active",toggleCaseStudyStatus);
router.delete("/:id",deleteCaseStudy);

export default router;