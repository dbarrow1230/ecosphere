// backend/routes/studies/studySessionRoutes.js
import express from "express";
import {
 getStudySessions,
 getStudySessionById,
 createStudySession,
 updateStudySession,
 deleteStudySession
} from "../../controllers/studies/studySessionController.js";

const router=express.Router();

router.get("/",getStudySessions);
router.get("/:id",getStudySessionById);
router.post("/",createStudySession);
router.put("/:id",updateStudySession);
router.delete("/:id",deleteStudySession);

export default router;