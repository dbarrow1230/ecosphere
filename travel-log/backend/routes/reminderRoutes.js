// backend/routes/reminderRoutes.js
import express from "express";
import {createReminder,createReminderFromMentee,updateReminder,listMyReminders,dismissReminderModal,deleteReminder} from "../controllers/reminderController.js";

const router=express.Router();

router.get("/",listMyReminders);
router.post("/",createReminder);
router.put("/:id",updateReminder);
router.delete("/:id",deleteReminder);

router.post("/create-from-mentee",createReminderFromMentee);
router.put("/:id/update",updateReminder);
router.get("/mine",listMyReminders);
router.patch("/:id/dismiss",dismissReminderModal);
router.delete("/:id/delete",deleteReminder);

export default router;