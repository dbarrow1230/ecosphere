import EmployeeSettings from "../../models/employees/employeeSettingsModel.js";

export const getEmployeeSettings=async(req,res,next)=>{
 try{
  const settings=await EmployeeSettings.findOne({settingsKey:"default"});
  res.status(200).json(settings||{});
 }catch(error){
  next(error);
 }
};

export const saveEmployeeSettings=async(req,res,next)=>{
 try{
  const settings=await EmployeeSettings.findOneAndUpdate(
   {settingsKey:"default"},
   {...req.body,settingsKey:"default"},
   {new:true,runValidators:true,upsert:true,setDefaultsOnInsert:true}
  );
  res.status(200).json(settings);
 }catch(error){
  next(error);
 }
};
