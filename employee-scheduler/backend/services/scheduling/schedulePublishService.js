// backend/services/schedulePublishService.js
import Schedule from "../../models/scheduling/scheduleModel.js";
import Shift from "../../models/scheduling/shiftModel.js";
import {applyShiftStatus} from "../shiftStatusService.js";

const toDateOnly=(value)=>{
 const date=new Date(value);
 return new Date(date.getFullYear(),date.getMonth(),date.getDate());
};

const getWeekRange=(weekStart,weekEnd=null)=>{
 const start=toDateOnly(weekStart);
 const end=weekEnd?toDateOnly(weekEnd):new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);
 end.setHours(23,59,59,999);
 return {start,end};
};

const getScheduleQueryRange=(scheduleDoc)=>{
 return getWeekRange(scheduleDoc.weekStart,scheduleDoc.weekEnd);
};

const getShiftQuery=(scheduleDoc)=>{
 const {start,end}=getScheduleQueryRange(scheduleDoc);

 return {
  business:scheduleDoc.business,
  shiftDate:{
   $gte:start,
   $lte:end
  },
  ...(scheduleDoc.department?{department:scheduleDoc.department}:{})
 };
};

export const createScheduleDraft=async(payload={})=>{
 if(!payload.business)throw new Error("Business is required.");
 if(!payload.weekStart)throw new Error("Week start is required.");

 const {start,end}=getWeekRange(payload.weekStart,payload.weekEnd);

 const schedule=await Schedule.create({
  ...payload,
  weekStart:start,
  weekEnd:end,
  status:payload.status||"draft"
 });

 return schedule;
};

export const publishSchedule=async({scheduleId,publishedBy=null})=>{
 const schedule=await Schedule.findById(scheduleId);

 if(!schedule)throw new Error("Schedule not found.");
 if(schedule.status==="closed")throw new Error("Closed schedules cannot be published.");

 const shifts=await Shift.find(getShiftQuery(schedule));

 for(const shift of shifts){
  shift.published=true;
  shift.publishedAt=new Date();
  applyShiftStatus(shift);
  if(shift.status==="draft"&&shift.published)shift.status="open";
  await shift.save();
 }

 schedule.status="published";
 schedule.publishedAt=new Date();
 schedule.publishedBy=publishedBy||null;

 await schedule.save();

 return schedule;
};

export const unpublishSchedule=async({scheduleId})=>{
 const schedule=await Schedule.findById(scheduleId);

 if(!schedule)throw new Error("Schedule not found.");
 if(schedule.status==="closed")throw new Error("Closed schedules cannot be unpublished.");

 const shifts=await Shift.find(getShiftQuery(schedule));

 for(const shift of shifts){
  shift.published=false;
  shift.publishedAt=null;
  applyShiftStatus(shift);
  await shift.save();
 }

 schedule.status="draft";
 schedule.publishedAt=null;
 schedule.publishedBy=null;

 await schedule.save();

 return schedule;
};

export const lockSchedule=async({scheduleId,lockedBy=null})=>{
 const schedule=await Schedule.findById(scheduleId);

 if(!schedule)throw new Error("Schedule not found.");

 schedule.status="locked";
 schedule.lockedAt=new Date();
 schedule.lockedBy=lockedBy||null;

 await schedule.save();

 return schedule;
};

export const closeSchedule=async({scheduleId,closedBy=null})=>{
 const schedule=await Schedule.findById(scheduleId);

 if(!schedule)throw new Error("Schedule not found.");

 schedule.status="closed";
 schedule.closedAt=new Date();
 schedule.closedBy=closedBy||null;

 await schedule.save();

 return schedule;
};

export const republishSchedule=async({scheduleId,publishedBy=null})=>{
 const schedule=await Schedule.findById(scheduleId);

 if(!schedule)throw new Error("Schedule not found.");
 if(schedule.status==="closed")throw new Error("Closed schedules cannot be republished.");

 const shifts=await Shift.find(getShiftQuery(schedule));

 for(const shift of shifts){
  shift.published=true;
  shift.publishedAt=new Date();
  applyShiftStatus(shift);
  await shift.save();
 }

 schedule.status="published";
 schedule.publishedAt=new Date();
 schedule.publishedBy=publishedBy||null;

 await schedule.save();

 return schedule;
};

export default {
 createScheduleDraft,
 publishSchedule,
 unpublishSchedule,
 lockSchedule,
 closeSchedule,
 republishSchedule
};