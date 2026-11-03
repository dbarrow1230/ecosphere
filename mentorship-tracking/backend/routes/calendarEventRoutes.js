// backend/routes/calendarEventRoutes.js
import express from "express";
import {
 createCalendarEvent,
 getCalendarEvents,
 getCalendarEventById,
 getCalendarEventsByMentee,
 updateCalendarEvent,
 deleteCalendarEvent
} from "../controllers/calendarEventController.js";

const router=express.Router();

router.post("/create",createCalendarEvent);
router.get("/list",getCalendarEvents);
router.get("/mentee/:menteeId",getCalendarEventsByMentee);
router.get("/:id",getCalendarEventById);
router.put("/:id",updateCalendarEvent);
router.delete("/:id",deleteCalendarEvent);

export default router;