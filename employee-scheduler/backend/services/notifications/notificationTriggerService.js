// backend/services/notificationTriggerService.js
import {createNotification} from "./notificationService.js";

export const notifyShiftAssigned=async({business,employee,shiftId})=>{
 return createNotification({
  business,
  employee,
  type:"shift-assigned",
  title:"Shift Assigned",
  message:"You have been assigned a new shift.",
  entityType:"Shift",
  entityId:shiftId
 });
};

export default {
 notifyShiftAssigned
};