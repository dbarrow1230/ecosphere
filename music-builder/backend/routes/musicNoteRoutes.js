import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createMusicNote,getMusicNotes,getMusicNoteById,updateMusicNote,deleteMusicNote} from "../controllers/musicNoteController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getMusicNotes).post(createMusicNote);
router.route("/:id").get(getMusicNoteById).put(updateMusicNote).patch(updateMusicNote).delete(deleteMusicNote);
export default router;
