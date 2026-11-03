import ServiceRecord from "../models/serviceRecordModel.js";

// Derive service state from the saved record, avoiding partial multi-document writes on standalone MongoDB.
export default async function inventoryServiceState(items){
 if(!items.length)return items;
 const records=await ServiceRecord.find({status:"completed","equipment.equipmentRef":{$in:items.map(item=>item._id)}}).sort({serviceDate:1,completedAt:1}).lean();
 const state=new Map(items.map(item=>[String(item._id),{...item}]));
 for(const record of records)for(const result of record.equipment){
  const item=state.get(String(result.equipmentRef));if(!item)continue;
  item.lastServiceDate=record.serviceDate;
  if(record.serviceType==="inspection")item.lastInspectionDate=record.serviceDate;
  if(record.serviceType==="hydrostatic-test")item.lastHydrostaticTest=record.serviceDate;
  for(const field of ["nextInspectionDate","nextMaintenanceDate","nextHydrostaticTest"])if(result[field])item[field]=result[field];
  if(item.status!=="retired")item.status=result.outcome==="pass"?"in-service":result.outcome==="needs-service"?"needs-service":["replaced","retired"].includes(result.outcome)?"retired":"out-of-service";
  item.lastServiceRecord=record._id;
 }
 return items.map(item=>state.get(String(item._id)));
}
