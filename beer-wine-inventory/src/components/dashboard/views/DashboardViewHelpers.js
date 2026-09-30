// src/components/dashboard/views/DashboardViewHelpers.js

export const getRefName=value=>{
 if(!value)return "";
 if(typeof value==="string")return "";
 if(typeof value==="object")return value.name||value.title||value.label||value.description||"";
 return "";
};

export const getGroupName=item=>{
 return getRefName(item?.category)||getRefName(item?.ingredientCategory)||getRefName(item?.menuCategory)||item?.categoryName||item?.groupName||"Uncategorized";
};

export const getItemDate=item=>{
 return item?.dueDateDisplay||item?.orderDateDisplay||item?.productionDateDisplay||item?.deliveryDateDisplay||item?.createdAtDisplay||item?.updatedAtDisplay||item?.dateDisplay||"";
};

export const getItemDateRaw=item=>{
 return item?.dueDate||item?.orderDate||item?.productionDate||item?.deliveryDate||item?.createdAt||item?.updatedAt||item?.date||null;
};

export const getStatus=item=>{
 return item?.status||item?.orderStatus||item?.productionStatus||item?.inventoryStatus||item?.priorityLevel||item?.category||"Active";
};