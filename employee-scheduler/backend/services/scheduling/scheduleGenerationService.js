// backend/services/scheduling/scheduleGenerationService.js
import Schedule from "../../models/scheduling/scheduleModel.js";
import Shift from "../../models/scheduling/shiftModel.js";

const toDateOnly=(value)=>{
 const date=new Date(value);
 return new Date(date.getFullYear(),date.getMonth(),date.getDate());
};

export const generateScheduleDraft=async({business,department=null,weekStart,title=""})=>{
 const start=toDateOnly(weekStart);
 const end=new Date(start);
 end.setDate(end.getDate()+6);
 end.setHours(23,59,59,999);

 const existing=await Schedule.findOne({
  business,
  department:department||null,
  weekStart:start
 });

 if(existing)return existing;

 return Schedule.create({
  business,
  department:department||null,
  title:title||"Weekly Schedule",
  weekStart:start,
  weekEnd:end,
  status:"draft"
 });
};

export const getScheduleShifts=async({business,department=null,weekStart})=>{
 const start=toDateOnly(weekStart);
 const end=new Date(start);
 end.setDate(end.getDate()+6);
 end.setHours(23,59,59,999);

 return Shift.find({
  business,
  ...(department?{department}:{ }),
  shiftDate:{$gte:start,$lte:end}
 }).sort({shiftDate:1,startTime:1});
};

export default {
 generateScheduleDraft,
 getScheduleShifts
};