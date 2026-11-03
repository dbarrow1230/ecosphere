// src/components/dashboard/views/DashboardViewHelpers.js

export const getRefName=value=>{
 if(!value)return "";
 if(typeof value==="string")return "";
 if(typeof value==="object")return value.name||value.title||value.label||value.description||"";
 return "";
};

export const getGroupName=item=>{
 return getRefName(item?.category)||getRefName(item?.travelCategory)||getRefName(item?.destinationCategory)||item?.categoryName||item?.groupName||"Uncategorized";
};

export const getItemDate=item=>{
 return item?.dueDateDisplay||item?.tripDateDisplay||item?.departureDateDisplay||item?.arrivalDateDisplay||item?.returnDateDisplay||item?.createdAtDisplay||item?.updatedAtDisplay||item?.dateDisplay||"";
};

export const getItemDateRaw=item=>{
 return item?.dueDate||item?.tripDate||item?.departureDate||item?.arrivalDate||item?.returnDate||item?.createdAt||item?.updatedAt||item?.date||null;
};

export const getStatus=item=>{
 return item?.status||item?.tripStatus||item?.travelStatus||item?.bookingStatus||item?.priorityLevel||item?.category||"Active";
};