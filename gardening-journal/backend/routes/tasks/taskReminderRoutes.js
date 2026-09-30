import express from "express";
import {
createReminder,
getReminders,
getReminderById,
updateReminder,
deleteReminder,
getDueReminders
} from "../../controllers/tasks/taskReminderController.js";

const router=express.Router();

router.post("/",createReminder);
router.get("/",getReminders);

// MUST be before /:id
router.get("/due",getDueReminders);

router.get("/:id",getReminderById);
router.put("/:id",updateReminder);
router.delete("/:id",deleteReminder);

export default router;