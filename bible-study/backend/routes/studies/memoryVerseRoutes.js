// backend/routes/studies/memoryVerseRoutes.js
import express from "express";
import {
 getMemoryVerses,
 getMemoryVerseById,
 createMemoryVerse,
 updateMemoryVerse,
 deleteMemoryVerse
} from "../../controllers/studies/memoryVerseController.js";

const router=express.Router();

router.get("/",getMemoryVerses);
router.get("/:id",getMemoryVerseById);
router.post("/",createMemoryVerse);
router.put("/:id",updateMemoryVerse);
router.delete("/:id",deleteMemoryVerse);

export default router;