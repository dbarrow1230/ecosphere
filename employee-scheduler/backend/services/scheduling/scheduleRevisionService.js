// backend/services/scheduling/scheduleRevisionService.js
import Schedule from "../../models/scheduling/scheduleModel.js";

export const reviseSchedule=async({scheduleId,updates})=>{
 const schedule=await Schedule.findById(scheduleId);
 if(!schedule)throw new Error("Schedule not found.");
 if(["locked","closed"].includes(String(schedule.status||"")))throw new Error("Schedule cannot be revised.");

 Object.assign(schedule,updates||{});
 schedule.status="draft";

 await schedule.save();

 return schedule;
};

export const reopenSchedule=async({scheduleId})=>{
 const schedule=await Schedule.findById(scheduleId);
 if(!schedule)throw new Error("Schedule not found.");
 if(schedule.status!=="closed")throw new Error("Only closed schedules can be reopened.");

 schedule.status="draft";
 await schedule.save();

 return schedule;
};

export default {
 reviseSchedule,
 reopenSchedule
};