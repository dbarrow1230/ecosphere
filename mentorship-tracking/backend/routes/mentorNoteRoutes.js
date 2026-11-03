// backend/routes/mentorNoteRoutes.js
import express from "express";
import {
 createMentorNote,
 getMentorNotes,
 getMentorNoteById,
 getMentorNotesByMentee,
 updateMentorNote,
 deleteMentorNote
} from "../controllers/mentorNoteController.js";

const router=express.Router();

router.post("/create",createMentorNote);
router.get("/list",getMentorNotes);
router.get("/mentee/:menteeId",getMentorNotesByMentee);
router.get("/:id",getMentorNoteById);
router.put("/:id",updateMentorNote);
router.delete("/:id",deleteMentorNote);

export default router;