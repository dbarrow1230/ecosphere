// backend/controllers/employees/employeeEventController.js
import EmployeeEvent from "../../models/employees/employeeEventModel.js";

const eventPopulate=[{path:"employeeRef",model:"Employee"}];

export const createEmployeeEvent=async(req,res,next)=>{
 try{
  const event=await EmployeeEvent.create(req.body);
  const result=await EmployeeEvent.findById(event._id).populate(eventPopulate);
  res.status(201).json(result);
 }catch(error){
  next(error);
 }
};

export const getEmployeeEvents=async(req,res,next)=>{
 try{
  const events=await EmployeeEvent.find().populate(eventPopulate).sort({createdOn:-1});
  res.status(200).json(events);
 }catch(error){
  next(error);
 }
};

export const updateEmployeeEvent=async(req,res,next)=>{
 try{
  const event=await EmployeeEvent.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate(eventPopulate);
  if(!event)return res.status(404).json({message:"Employee event not found"});
  res.status(200).json(event);
 }catch(error){
  next(error);
 }
};
