import express from "express";
import {
 getStructureNotes,
 getStructureNoteById,
 saveStructureWritingDraft,
 createStructureNote,
 updateStructureNote,
 archiveStructureNote,
 toggleFavoriteStructureNote,
 deleteStructureNote
} from "../controllers/structureNoteController.js";

const router=express.Router();

router.route("/")
 .get(getStructureNotes)
 .post(createStructureNote);

router.patch("/:id/archive",archiveStructureNote);
router.patch("/:id/favorite",toggleFavoriteStructureNote);
router.put("/:id/writing-draft",saveStructureWritingDraft);

router.route("/:id")
 .get(getStructureNoteById)
 .put(updateStructureNote)
 .delete(deleteStructureNote);

export default router;
