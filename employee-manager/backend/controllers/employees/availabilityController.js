import mongoose from "mongoose";
import Availability from "../../models/employees/availabilityModel.js";
import Employee from "../../models/employees/employeeModel.js";
import {validateAvailability} from "./availabilityValidation.js";

export async function getAvailability(req,res,next){
 if(req.query.employee&&!mongoose.isValidObjectId(req.query.employee))return res.status(400).json({message:"Choose a valid employee."});
 try{const data=await Availability.find(req.query.employee?{employee:req.query.employee}:{}).populate({path:"employee",model:Employee,select:"firstName lastName employeeNumber"}).lean();res.json({data});}catch(error){next(error);}
}
export async function saveAvailability(req,res,next){
 if(!mongoose.isValidObjectId(req.body.employee))return res.status(400).json({message:"Choose a valid employee."});
 try{
  if(!await Employee.exists({_id:req.body.employee}))return res.status(404).json({message:"Employee not found."});
  let payload;try{payload=validateAvailability(req.body);}catch(error){return res.status(400).json({message:error.message});}
  const data=await Availability.findOneAndUpdate({employee:req.body.employee},{$set:payload},{upsert:true,returnDocument:"after",runValidators:true,setDefaultsOnInsert:true});
  res.json({message:"Availability saved.",data});
 }catch(error){next(error);}
}
