// backend/routes/noteHistoryRoutes.js
import express from "express";
import{
 createNoteHistory,
 getNoteHistories,
 getNoteHistoryById,
 updateNoteHistory,
 deleteNoteHistory
}from "../controllers/noteHistoryController.js";

const router=express.Router();

router.post("/",createNoteHistory);
router.get("/",getNoteHistories);
router.get("/:id",getNoteHistoryById);
router.put("/:id",updateNoteHistory);
router.delete("/:id",deleteNoteHistory);

export default router;