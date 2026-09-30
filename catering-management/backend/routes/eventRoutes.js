// backend/routes/eventRoutes.js
import express from "express";
import {createEvent,getEvents,getSingleEvent,updateEvent,deleteEvent} from "../controllers/eventController.js";

const router=express.Router();

router.post("/",createEvent);
router.get("/",getEvents);
router.get("/:id",getSingleEvent);
router.put("/:id",updateEvent);
router.delete("/:id",deleteEvent);

export default router;