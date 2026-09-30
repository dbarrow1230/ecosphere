// backend/controllers/employees/employeeController.js
import Employee from "../../models/employees/employeeModel.js";

export const createEmployee=async(req,res,next)=>{
 try{
  const employee=await Employee.create(req.body);
  res.status(201).json(employee);
 }catch(error){
  next(error);
 }
};

export const getEmployees=async(req,res,next)=>{
 try{
  const employees=await Employee.find().sort({lastName:1,firstName:1});
  res.status(200).json(employees);
 }catch(error){
  next(error);
 }
};

export const getEmployeeById=async(req,res,next)=>{
 try{
  const employee=await Employee.findById(req.params.id);
  if(!employee)return res.status(404).json({message:"Employee not found"});
  res.status(200).json(employee);
 }catch(error){
  next(error);
 }
};

export const updateEmployee=async(req,res,next)=>{
 try{
  const employee=await Employee.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!employee)return res.status(404).json({message:"Employee not found"});
  res.status(200).json(employee);
 }catch(error){
  next(error);
 }
};

export const archiveEmployee=async(req,res,next)=>{
 try{
  const employee=await Employee.findByIdAndUpdate(req.params.id,{status:"Archived",isActive:false},{new:true});
  if(!employee)return res.status(404).json({message:"Employee not found"});
  res.status(200).json(employee);
 }catch(error){
  next(error);
 }
};
