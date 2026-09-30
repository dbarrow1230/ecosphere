// backend/routes/studies/studyRoutes.js
import express from "express";
import {
 getStudies,
 getStudyById,
 createStudy,
 updateStudy,
 deleteStudy
} from "../../controllers/studies/studyController.js";

const router=express.Router();

router.get("/",getStudies);
router.get("/:id",getStudyById);
router.post("/",createStudy);
router.put("/:id",updateStudy);
router.delete("/:id",deleteStudy);

export default router;