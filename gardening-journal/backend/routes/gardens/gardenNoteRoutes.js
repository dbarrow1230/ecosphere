// backend/routes/gardens/gardenNoteRoutes.js
import express from "express";
import {
createGardenNote,
getGardenNotes,
getGardenNoteById,
updateGardenNote,
deleteGardenNote
} from "../../controllers/gardens/gardenNoteController.js";

const router=express.Router();

router.post("/",createGardenNote);
router.get("/",getGardenNotes);
router.get("/:id",getGardenNoteById);
router.put("/:id",updateGardenNote);
router.delete("/:id",deleteGardenNote);

export default router;