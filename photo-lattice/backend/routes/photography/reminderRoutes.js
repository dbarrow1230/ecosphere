import express from "express";
import {protect} from "../../middleware/authMiddleware.js";
import {getReminders,getReminder,createReminder,updateReminder,deleteReminder} from "../../controllers/photography/reminderController.js";
const router=express.Router();
router.use(protect);
router.route("/").get(getReminders).post(createReminder);
router.route("/:id").get(getReminder).put(updateReminder).delete(deleteReminder);
export default router;
