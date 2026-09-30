// /backend/routes/reminderRoutes.js
import express from 'express';
import{createReminder,getReminders,getPendingReminders,getReminderById,getRemindersByUser,updateReminder,deleteReminder}from '../controllers/reminderController.js';

const router=express.Router();

router.post('/',createReminder);
router.get('/',getReminders);
router.get('/pending',getPendingReminders);
router.get('/user/:userId',getRemindersByUser);
router.get('/:id',getReminderById);
router.put('/:id',updateReminder);
router.delete('/:id',deleteReminder);

export default router;