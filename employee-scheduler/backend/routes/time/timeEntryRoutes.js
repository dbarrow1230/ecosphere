// backend/routes/time/timeEntryRoutes.js
import express from "express";
import {
 createTimeEntry,
 getTimeEntries,
 getTimeEntryById,
 updateTimeEntry,
 deleteTimeEntry
} from "../../controllers/time/timeEntryController.js";

const router=express.Router();

router.post("/",createTimeEntry);
router.get("/",getTimeEntries);
router.get("/:id",getTimeEntryById);
router.put("/:id",updateTimeEntry);
router.delete("/:id",deleteTimeEntry);

export default router;