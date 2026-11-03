import express from "express";
import {createEvent,deleteEvent,getEventById,getEvents,updateEvent} from "../../controllers/operations/eventController.js";

const router=express.Router();
router.get("/",getEvents);
router.post("/",createEvent);
router.get("/:id",getEventById);
router.put("/:id",updateEvent);
router.delete("/:id",deleteEvent);
export default router;
