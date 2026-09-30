// backend/controllers/employees/employeeNotificationSettingController.js
import EmployeeNotificationSetting from "../../models/employees/employeeNotificationSettingModel.js";

export const createEmployeeNotificationSetting=async(req,res,next)=>{
 try{
  const setting=await EmployeeNotificationSetting.create(req.body);
  res.status(201).json(setting);
 }catch(error){
  next(error);
 }
};

export const getEmployeeNotificationSettings=async(req,res,next)=>{
 try{
  const settings=await EmployeeNotificationSetting.find().sort({eventType:1,name:1});
  res.status(200).json(settings);
 }catch(error){
  next(error);
 }
};

export const updateEmployeeNotificationSetting=async(req,res,next)=>{
 try{
  const setting=await EmployeeNotificationSetting.findByIdAndUpdate(
   req.params.id,
   req.body,
   {new:true,runValidators:true}
  );

  if(!setting)return res.status(404).json({message:"Employee notification setting not found"});

  res.status(200).json(setting);
 }catch(error){
  next(error);
 }
};

export const deleteEmployeeNotificationSetting=async(req,res,next)=>{
 try{
  const setting=await EmployeeNotificationSetting.findByIdAndDelete(req.params.id);
  if(!setting)return res.status(404).json({message:"Employee notification setting not found"});
  res.status(200).json({message:"Employee notification setting deleted successfully"});
 }catch(error){
  next(error);
 }
};
