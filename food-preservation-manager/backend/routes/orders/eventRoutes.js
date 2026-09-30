import express from "express";
import {createEvent,deleteEvent,getEventById,getEvents,updateEvent} from "../../controllers/orders/eventController.js";

const router=express.Router();

router.get("/",getEvents);
router.get("/:id",getEventById);
router.post("/",createEvent);
router.put("/:id",updateEvent);
router.delete("/:id",deleteEvent);

export default router;
