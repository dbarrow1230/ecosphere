import express from "express";
import {
 getIdSequences,
 getIdSequenceById,
 createIdSequence,
 updateIdSequence,
 getNextId,
 previewNextId,
 deleteIdSequence
} from "../controllers/idSequenceController.js";

const router=express.Router();

router.route("/")
 .get(getIdSequences)
 .post(createIdSequence);

router.post("/next",getNextId);
router.post("/preview",previewNextId);

router.route("/:id")
 .get(getIdSequenceById)
 .put(updateIdSequence)
 .delete(deleteIdSequence);

export default router;
