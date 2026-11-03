// backend/routes/reminderRoutes.js
import express from "express";
import {createReminder,createReminderFromMentee,updateReminder,listMyReminders,dismissReminderModal,deleteReminder} from "../controllers/reminders/reminderController.js";

const router=express.Router();

router.post("/",createReminder);
router.post("/create-from-mentee",createReminderFromMentee);
router.get("/",listMyReminders);
router.put("/:id/update",updateReminder);
router.put("/:id",updateReminder);
router.get("/mine",listMyReminders);
router.patch("/:id/dismiss",dismissReminderModal);
router.delete("/:id/delete",deleteReminder);
router.delete("/:id",deleteReminder);

export default router;
