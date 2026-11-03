// backend/routes/noteTypeRoutes.js
import express from "express";
import{
 createNoteType,
 getNoteTypes,
 getNoteTypeById,
 updateNoteType,
 deleteNoteType
}from "../controllers/noteTypeController.js";

const router=express.Router();

router.post("/",createNoteType);
router.get("/",getNoteTypes);
router.get("/:id",getNoteTypeById);
router.put("/:id",updateNoteType);
router.delete("/:id",deleteNoteType);

export default router;