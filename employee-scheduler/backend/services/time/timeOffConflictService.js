// backend/services/time/timeOffConflictService.js
import TimeOffRequest from "../../models/employee/timeOffRequestModel.js";

export const getApprovedTimeOffConflicts=async({business,employee,startDate,endDate})=>{
 return TimeOffRequest.find({
  business,
  employee,
  status:"approved",
  startDate:{$lte:new Date(endDate)},
  endDate:{$gte:new Date(startDate)}
 }).sort({startDate:1});
};

export default {
 getApprovedTimeOffConflicts
};