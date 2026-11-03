import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createLyricIdea,getLyricIdeas,getLyricIdeaById,updateLyricIdea,deleteLyricIdea} from "../controllers/lyricIdeaController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getLyricIdeas).post(createLyricIdea);
router.route("/:id").get(getLyricIdeaById).put(updateLyricIdea).patch(updateLyricIdea).delete(deleteLyricIdea);
export default router;
