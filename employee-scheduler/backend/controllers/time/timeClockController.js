import mongoose from "mongoose";
import Employee from "../../models/employee/employeeModel.js";
import TimeEntry from "../../models/time/timeEntryModel.js";
import {clockIn,clockOut,startBreak,endBreak} from "../../services/time/timeEntryService.js";

const handle=action=>async(req,res)=>{
 try{
  const input=req.method==="GET"?req.query:req.body;
  const business=String(input.business||"").trim();
  const clockId=String(input.clockId||"").trim();
  if(!mongoose.isValidObjectId(business)||!/^\d{5}$/.test(clockId))return res.status(400).json({message:"Provide a valid business and five-digit employee clock ID."});
  const employee=await Employee.findOne({business,employeeId:clockId,isArchived:false,isActive:true});
  if(!employee)return res.status(404).json({message:"Employee not found."});
  if(!action){
   const entry=await TimeEntry.findOne({business,employee:employee._id,status:{$in:["active","on-break"]}}).sort({createdAt:-1});
   return res.json(entry);
  }
  if(input.shiftId&&!mongoose.isValidObjectId(input.shiftId))return res.status(400).json({message:"Invalid shift ID."});
  if(input.type&&!['break','lunch'].includes(input.type))return res.status(400).json({message:"Invalid break type."});
  const entry=await action({business,clockId,employeeId:employee._id,shiftId:input.shiftId||null,type:input.type||"break",method:"kiosk",createdBy:req.user?._id||null});
  return res.json(entry);
 }catch(error){return res.status(400).json({message:error.message});}
};

export const getActiveEntry=handle(null);
export const recordClockIn=handle(clockIn);
export const recordClockOut=handle(clockOut);
export const recordBreakStart=handle(startBreak);
export const recordBreakEnd=handle(endBreak);
