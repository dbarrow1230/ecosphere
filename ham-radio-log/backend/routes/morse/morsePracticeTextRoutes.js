// backend/routes/morse/morsePracticeTextRoutes.js
import express from "express";
import {
 createMorsePracticeText,
 getMorsePracticeTexts,
 getMorsePracticeTextById,
 updateMorsePracticeText,
 archiveMorsePracticeText,
 deleteMorsePracticeText
} from "../../controllers/morse/morsePracticeTextController.js";
import {protect} from "../../middleware/authMiddleware.js";

const router=express.Router();
router.use(protect);

router.post("/",createMorsePracticeText);
router.get("/",getMorsePracticeTexts);
router.get("/:id",getMorsePracticeTextById);
router.put("/:id",updateMorsePracticeText);
router.patch("/:id/archive",archiveMorsePracticeText);
router.delete("/:id",deleteMorsePracticeText);

export default router;
