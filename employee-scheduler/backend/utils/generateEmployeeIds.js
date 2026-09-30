// backend/utils/generateEmployeeIds.js
import Counter from "../models/counterModel.js";

const padSerial=(num)=>String(num).padStart(5,"0");

export const getNextEmployeeClockId=async(businessId)=>{
 const counter=await Counter.findOneAndUpdate(
  {business:businessId,type:"employee"},
  {$inc:{seq:1}},
  {returnDocument:"after",upsert:true,setDefaultsOnInsert:true}
 );

 if(!counter)throw new Error("Failed to generate employee counter.");

 if(counter.seq>99999)throw new Error("Employee clock ID limit reached for this business.");

 return padSerial(counter.seq);
};

export const buildEmployeeCode=(businessCode,clockId)=>{
 const cleanBusinessCode=String(businessCode||"").trim().toUpperCase();
 const cleanClockId=String(clockId||"").trim();
 return `${cleanBusinessCode}-${cleanClockId}`;
};