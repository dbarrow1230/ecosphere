import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createChordProgression,getChordProgressions,getChordProgressionById,updateChordProgression,deleteChordProgression} from "../controllers/chordProgressionController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getChordProgressions).post(createChordProgression);
router.route("/:id").get(getChordProgressionById).put(updateChordProgression).patch(updateChordProgression).delete(deleteChordProgression);
export default router;
