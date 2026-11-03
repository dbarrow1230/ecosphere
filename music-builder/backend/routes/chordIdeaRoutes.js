import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createChordIdea,getChordIdeas,getChordIdeaById,updateChordIdea,deleteChordIdea} from "../controllers/chordIdeaController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getChordIdeas).post(createChordIdea);
router.route("/:id").get(getChordIdeaById).put(updateChordIdea).patch(updateChordIdea).delete(deleteChordIdea);
export default router;
