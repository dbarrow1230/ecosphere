// backend/controllers/employees/weeklyScheduleController.js
import WeeklySchedule from "../../models/employees/weeklyScheduleModel.js";

const schedulePopulate=[{path:"employeeRef",model:"Employee"}];

export const createWeeklySchedule=async(req,res,next)=>{
 try{
  const schedule=await WeeklySchedule.create(req.body);
  const result=await WeeklySchedule.findById(schedule._id).populate(schedulePopulate);
  res.status(201).json(result);
 }catch(error){
  next(error);
 }
};

export const getWeeklySchedules=async(req,res,next)=>{
 try{
  const schedules=await WeeklySchedule.find().populate(schedulePopulate).sort({updatedAt:-1});
  res.status(200).json(schedules);
 }catch(error){
  next(error);
 }
};

export const updateWeeklySchedule=async(req,res,next)=>{
 try{
  const schedule=await WeeklySchedule.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}).populate(schedulePopulate);
  if(!schedule)return res.status(404).json({message:"Weekly schedule not found"});
  res.status(200).json(schedule);
 }catch(error){
  next(error);
 }
};
