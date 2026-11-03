// backend/jobs/reminderJob.js
import cron from "node-cron";
import Reminder from "../models/tasks/reminderModel.js";

const startReminderJob=()=>{
	cron.schedule("* * * * *",async()=>{
		try{
			const now=new Date();

			const reminders=await Reminder.find({
				isActive:true,
				isSent:false,
				remindAt:{$lte:now}
			}).populate("task");

			for(const reminder of reminders){
				// handle delivery here
				console.log("Reminder due:",reminder.message||reminder.task?.name);

				reminder.isSent=true;
				reminder.sentAt=new Date();
				await reminder.save();
			}
		}catch(error){
			console.error("Reminder job error:",error.message);
		}
	});
};

export default startReminderJob;