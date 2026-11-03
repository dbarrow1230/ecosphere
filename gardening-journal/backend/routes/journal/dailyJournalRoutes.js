// backend/routes/journal/dailyJournalRoutes.js
import express from "express";
import {
createDailyJournal,
getDailyJournals,
getDailyJournalById,
updateDailyJournal,
addDailyJournalNote,
deleteDailyJournal
} from "../../controllers/journal/dailyJournalController.js";

const router=express.Router();

router.post("/",createDailyJournal);
router.get("/",getDailyJournals);
router.get("/:id",getDailyJournalById);
router.put("/:id",updateDailyJournal);
router.patch("/:id/notes",addDailyJournalNote);
router.delete("/:id",deleteDailyJournal);

export default router;