// backend/routes/employee/archiveRoutes.js
import express from "express";
import {
 createArchiveEvent,
 getArchiveEvents,
 getArchiveEventById,
 updateArchiveEvent,
 deleteArchiveEvent
} from "../controllers/archiveController.js";

const router=express.Router();

router.post("/",createArchiveEvent);
router.get("/",getArchiveEvents);
router.get("/:id",getArchiveEventById);
router.put("/:id",updateArchiveEvent);
router.delete("/:id",deleteArchiveEvent);

export default router;