// backend/controllers/employees/employeeAlertController.js
import EmployeeAlert from "../../models/employees/employeeAlertModel.js";

const alertPopulate=[
 {path:"settingRef",model:"EmployeeNotificationSetting"},
 {path:"eventRef",model:"EmployeeEvent"},
 {path:"payrollRef",model:"Payroll"}
];

export const getEmployeeAlerts=async(req,res,next)=>{
 try{
  const alerts=await EmployeeAlert.find().populate(alertPopulate).sort({sentAt:-1,createdAt:-1});
  res.status(200).json(alerts);
 }catch(error){
  next(error);
 }
};

export const markEmployeeAlertRead=async(req,res,next)=>{
 try{
  const alert=await EmployeeAlert.findByIdAndUpdate(
   req.params.id,
   {status:"read",readAt:new Date()},
   {new:true}
  ).populate(alertPopulate);

  if(!alert)return res.status(404).json({message:"Employee alert not found"});

  res.status(200).json(alert);
 }catch(error){
  next(error);
 }
};
