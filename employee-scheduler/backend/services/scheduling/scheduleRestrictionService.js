// backend/services/scheduleRestrictionService.js
import Schedule from "../../models/scheduling/scheduleModel.js";

export const canEditSchedule=async({scheduleId})=>{
 const schedule=await Schedule.findById(scheduleId);
 if(!schedule)throw new Error("Schedule not found.");

 if(["locked","closed"].includes(schedule.status)){
  return false;
 }

 return true;
};

export default {
 canEditSchedule
};