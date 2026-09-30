// backend/controllers/employees/payrollController.js
import Payroll from "../../models/employees/payrollModel.js";

export const createPayroll=async(req,res,next)=>{
 try{
  const payroll=await Payroll.create(req.body);
  res.status(201).json(payroll);
 }catch(error){
  next(error);
 }
};

export const getPayrolls=async(req,res,next)=>{
 try{
  const payrolls=await Payroll.find().sort({fromDate:-1});
  res.status(200).json(payrolls);
 }catch(error){
  next(error);
 }
};

export const updatePayroll=async(req,res,next)=>{
 try{
  const payroll=await Payroll.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!payroll)return res.status(404).json({message:"Payroll not found"});
  res.status(200).json(payroll);
 }catch(error){
  next(error);
 }
};
