// backend/services/dashboardService.js
import Shift from "../models/scheduling/shiftModel.js";
import TimeEntry from "../models/time/timeEntryModel.js";

export const getDashboardStats=async({business})=>{
 const today=new Date();
 today.setHours(0,0,0,0);

 const shiftsToday=await Shift.countDocuments({
  business,
  shiftDate:today
 });

 const openShifts=await Shift.countDocuments({
  business,
  status:"open"
 });

 const activeEmployees=await TimeEntry.countDocuments({
  business,
  status:"active"
 });

 return {
  shiftsToday,
  openShifts,
  activeEmployees
 };
};

export default {
 getDashboardStats
};