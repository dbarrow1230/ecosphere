import express from "express";
import {
 getFleetingNotes,
 getFleetingNoteById,
 createFleetingNote,
 updateFleetingNote,
 processFleetingNote,
 archiveFleetingNote,
 deleteFleetingNote
} from "../controllers/fleetingNoteController.js";

const router=express.Router();

router.route("/")
 .get(getFleetingNotes)
 .post(createFleetingNote);

router.patch("/:id/process",processFleetingNote);
router.patch("/:id/archive",archiveFleetingNote);

router.route("/:id")
 .get(getFleetingNoteById)
 .put(updateFleetingNote)
 .delete(deleteFleetingNote);

export default router;