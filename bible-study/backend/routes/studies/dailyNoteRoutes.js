// backend/routes/studies/dailyNoteRoutes.js
import express from "express";
import {
 getDailyNotes,
 getDailyNoteById,
 createDailyNote,
 updateDailyNote,
 deleteDailyNote
} from "../../controllers/studies/dailyNoteController.js";

const router=express.Router();

router.get("/",getDailyNotes);
router.get("/:id",getDailyNoteById);
router.post("/",createDailyNote);
router.put("/:id",updateDailyNote);
router.delete("/:id",deleteDailyNote);

export default router;
