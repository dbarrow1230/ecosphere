//backend/routes/consulting/assessmentRoutes.js
import express from "express";
import{
 createAssessment,
 getAssessments,
 getAssessmentById,
 updateAssessment,
 deleteAssessment,
 toggleAssessmentStatus
}from "../../controllers/consulting/assessmentController.js";

const router=express.Router();

router.post("/",createAssessment);
router.get("/",getAssessments);
router.get("/:id",getAssessmentById);
router.put("/:id",updateAssessment);
router.patch("/:id/toggle-active",toggleAssessmentStatus);
router.delete("/:id",deleteAssessment);

export default router;