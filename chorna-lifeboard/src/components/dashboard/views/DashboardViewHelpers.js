// src/components/dashboard/views/DashboardViewHelpers.js

export const getRefName=value=>{
 if(!value)return "";
 if(typeof value==="string")return "";
 if(typeof value==="object")return value.name||value.title||value.label||value.description||"";
 return "";
};

export const getGroupName=item=>{
 return getRefName(item?.lifeArea)||getRefName(item?.category)||item?.area||item?.categoryName||item?.lifeAreaName||"Uncategorized";
};

export const getItemDate=item=>{
 return item?.dueDateDisplay||item?.targetDateDisplay||item?.entryDateDisplay||item?.startDateDisplay||item?.noteDateDisplay||item?.memoryDateDisplay||item?.milestoneDateDisplay||item?.logDateDisplay||item?.sendAtDisplay||item?.createdAtDisplay||item?.dateDisplay||"";
};

export const getItemDateRaw=item=>{
 return item?.dueDate||item?.targetDate||item?.entryDate||item?.startDate||item?.noteDate||item?.memoryDate||item?.milestoneDate||item?.logDate||item?.sendAt||item?.createdAt||item?.date||null;
};

export const getStatus=item=>{
 return item?.status||item?.priorityLevel||item?.journalType||item?.noteType||item?.eventType||item?.reminderType||item?.mood||"Active";
};