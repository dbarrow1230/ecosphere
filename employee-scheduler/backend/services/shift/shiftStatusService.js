// backend/services/shiftStatusService.js
const ACTIVE_ASSIGNED_STATUSES=["assigned","confirmed","completed"];

export const getAssignedEmployeeCount=(assignedEmployees=[])=>{
 return assignedEmployees.filter((item)=>ACTIVE_ASSIGNED_STATUSES.includes(String(item?.status||""))).length;
};

export const calculateShiftStatus=({
 currentStatus="draft",
 requiredEmployees=1,
 assignedEmployees=[],
 published=false,
 shiftDate=null,
 endTime=""
})=>{
 if(currentStatus==="cancelled")return "cancelled";
 if(currentStatus==="completed")return "completed";

 const assignedCount=getAssignedEmployeeCount(assignedEmployees);
 const requiredCount=Math.max(Number(requiredEmployees||0),1);

 if(!published&&assignedCount===0)return "draft";
 if(assignedCount===0)return "open";
 if(assignedCount<requiredCount)return "partially-filled";
 if(assignedCount>=requiredCount)return "assigned";

 return "draft";
};

export const applyShiftStatus=(shiftDoc)=>{
 if(!shiftDoc)return shiftDoc;
 shiftDoc.status=calculateShiftStatus({
  currentStatus:shiftDoc.status,
  requiredEmployees:shiftDoc.requiredEmployees,
  assignedEmployees:shiftDoc.assignedEmployees,
  published:shiftDoc.published,
  shiftDate:shiftDoc.shiftDate,
  endTime:shiftDoc.endTime
 });
 return shiftDoc;
};

export default {
 getAssignedEmployeeCount,
 calculateShiftStatus,
 applyShiftStatus
};