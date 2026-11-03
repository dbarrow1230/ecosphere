import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {createArrangementIdea,getArrangementIdeas,getArrangementIdeaById,updateArrangementIdea,deleteArrangementIdea} from "../controllers/arrangementIdeaController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getArrangementIdeas).post(createArrangementIdea);
router.route("/:id").get(getArrangementIdeaById).put(updateArrangementIdea).patch(updateArrangementIdea).delete(deleteArrangementIdea);
export default router;
