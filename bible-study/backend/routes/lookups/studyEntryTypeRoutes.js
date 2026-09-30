// backend/routes/lookups/studyEntryTypeRoutes.js
import express from "express";
import {
 getStudyEntryTypes,
 getStudyEntryTypeById,
 createStudyEntryType,
 updateStudyEntryType,
 deleteStudyEntryType
} from "../../controllers/lookups/studyEntryTypeController.js";

const router=express.Router();

router.get("/",getStudyEntryTypes);
router.get("/:id",getStudyEntryTypeById);
router.post("/",createStudyEntryType);
router.put("/:id",updateStudyEntryType);
router.delete("/:id",deleteStudyEntryType);

export default router;