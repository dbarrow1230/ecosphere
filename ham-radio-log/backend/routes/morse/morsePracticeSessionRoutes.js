// backend/routes/morse/morsePracticeSessionRoutes.js
import express from "express";
import {
 createMorsePracticeSession,
 getMorsePracticeSessions,
 getMorsePracticeSessionById,
 updateMorsePracticeSession,
 archiveMorsePracticeSession,
 deleteMorsePracticeSession
} from "../../controllers/morse/morsePracticeSessionController.js";
import {protect} from "../../middleware/authMiddleware.js";

const router=express.Router();
router.use(protect);

router.post("/",createMorsePracticeSession);
router.get("/",getMorsePracticeSessions);
router.get("/:id",getMorsePracticeSessionById);
router.put("/:id",updateMorsePracticeSession);
router.patch("/:id/archive",archiveMorsePracticeSession);
router.delete("/:id",deleteMorsePracticeSession);

export default router;
