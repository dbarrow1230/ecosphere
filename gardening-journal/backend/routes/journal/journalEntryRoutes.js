// backend/routes/journal/journalEntryRoutes.js
import express from "express";
import {
createJournalEntry,
getJournalEntries,
getJournalEntryById,
updateJournalEntry,
addJournalEntryNote,
deleteJournalEntry
} from "../../controllers/journal/journalEntryController.js";

const router=express.Router();

router.post("/",createJournalEntry);
router.get("/",getJournalEntries);
router.get("/:id",getJournalEntryById);
router.put("/:id",updateJournalEntry);
router.patch("/:id/notes",addJournalEntryNote);
router.delete("/:id",deleteJournalEntry);

export default router;