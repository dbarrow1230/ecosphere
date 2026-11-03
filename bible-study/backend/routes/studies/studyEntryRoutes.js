// backend/routes/studies/studyEntryRoutes.js
import express from "express";
import {
 getStudyEntries,
 getStudyEntryById,
 createStudyEntry,
 updateStudyEntry,
 deleteStudyEntry
} from "../../controllers/studies/studyEntryController.js";

const router=express.Router();

router.get("/",getStudyEntries);
router.get("/:id",getStudyEntryById);
router.post("/",createStudyEntry);
router.put("/:id",updateStudyEntry);
router.delete("/:id",deleteStudyEntry);

export default router;