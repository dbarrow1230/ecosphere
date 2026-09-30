import Employee from "../../models/employees/employeeModel.js";
import EmployeeSettings from "../../models/employees/employeeSettingsModel.js";
import TimeClock from "../../models/employees/timeClockModel.js";

const timeClockPopulate=[{path:"employeeRef",model:"Employee"}];
const actions=["clockIn","breakOut","breakIn","clockOut"];

const pad=value=>String(value).padStart(2,"0");
const timeText=date=>`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());
const endOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);

const minutes=value=>{
 if(!value)return 0;
 const [hours,mins,seconds]=String(value).split(":").map(Number);
 return (hours||0)*60+(mins||0)+(seconds||0)/60;
};

const totals=(entry,overtimeAfter=8)=>{
 const breakHours=Math.max(0,minutes(entry.breakIn)-minutes(entry.breakOut))/60;
 const totalHours=Math.max(0,minutes(entry.clockOut)-minutes(entry.clockIn))/60-breakHours;
 return{
  totalBreakHours:Number(breakHours.toFixed(2)),
  totalHours:Number(Math.max(0,totalHours).toFixed(2)),
  regularHours:Number(Math.min(Math.max(0,totalHours),overtimeAfter).toFixed(2)),
  overtimeHours:Number(Math.max(0,totalHours-overtimeAfter).toFixed(2))
 };
};

const nextAction=entry=>{
 if(!entry)return "clockIn";
 if(!entry.clockIn)return "clockIn";
 if(!entry.breakOut&&!entry.clockOut)return "breakOut";
 if(entry.breakOut&&!entry.breakIn&&!entry.clockOut)return "breakIn";
 if(!entry.clockOut)return "clockOut";
 return "complete";
};

const decorateEntries=async entries=>{
 const settings=await EmployeeSettings.findOne({settingsKey:"default"}).lean();
 const overtimeAfter=Number(settings?.dailyOvertimeAfter||8);
 return entries.map(entry=>{
  const object=entry.toObject?entry.toObject():entry;
  return{...object,...totals(object,overtimeAfter),nextAction:nextAction(object)};
 });
};

const findEmployee=async employeeNumber=>{
 const number=String(employeeNumber||"").trim();
 if(!number)return null;
 return Employee.findOne({employeeNumber:number,isActive:true,status:"Active"});
};

const findTodayEntry=async(employeeId,date=new Date())=>TimeClock.findOne({
 employeeRef:employeeId,
 workDate:{$gte:startOfDay(date),$lt:endOfDay(date)}
}).sort({createdAt:-1});

export const punchTimeClock=async(req,res,next)=>{
 try{
  const {employeeNumber,action}=req.body;
  if(!actions.includes(action))return res.status(400).json({message:"Invalid time clock action"});

  const employee=await findEmployee(employeeNumber);
  if(!employee)return res.status(404).json({message:"Active employee ID not found"});

  const now=new Date();
  let entry=await findTodayEntry(employee._id,now);
  const expected=nextAction(entry);

  if(action!==expected){
   return res.status(409).json({message:expected==="complete"?"This employee already completed today’s time clock entry":`The next available action is ${expected}`,nextAction:expected});
  }

  if(!entry){
   entry=await TimeClock.create({
    employeeRef:employee._id,
    workDate:startOfDay(now),
    clockIn:timeText(now),
    method:"Time Clock",
    auditTrail:[{action:"clockIn",userName:employeeNumber,note:"Employee punch station"}]
   });
  }else{
   entry[action]=timeText(now);
   entry.method="Time Clock";
   entry.auditTrail.push({action,userName:employeeNumber,note:"Employee punch station"});
   await entry.save();
  }

  const populated=await TimeClock.findById(entry._id).populate(timeClockPopulate);
  const [result]=await decorateEntries([populated]);
  res.status(action==="clockIn"?201:200).json(result);
 }catch(error){
  next(error);
 }
};

export const getTimeClockStatus=async(req,res,next)=>{
 try{
  const employee=await findEmployee(req.params.employeeNumber);
  if(!employee)return res.status(404).json({message:"Active employee ID not found"});
  const entry=await findTodayEntry(employee._id);
  const populated=entry?await TimeClock.findById(entry._id).populate(timeClockPopulate):null;
  const decorated=populated?(await decorateEntries([populated]))[0]:null;
  res.status(200).json({employee,entry:decorated,nextAction:nextAction(entry)});
 }catch(error){
  next(error);
 }
};

export const createTimeClockEntry=async(req,res,next)=>{
 try{
  const entry=await TimeClock.create({...req.body,method:req.body.method||"Manual",auditTrail:[...(req.body.auditTrail||[]),{action:"create",userName:req.body.editedBy||"Admin",note:"Manual entry"}]});
  const populated=await TimeClock.findById(entry._id).populate(timeClockPopulate);
  const [result]=await decorateEntries([populated]);
  res.status(201).json(result);
 }catch(error){next(error);}
};

export const getTimeClockEntries=async(req,res,next)=>{
 try{
  const query={};
  if(req.query.employee)query.employeeRef=req.query.employee;
  if(req.query.dateFrom||req.query.dateTo){
   query.workDate={};
   if(req.query.dateFrom)query.workDate.$gte=startOfDay(new Date(`${req.query.dateFrom}T00:00:00`));
   if(req.query.dateTo)query.workDate.$lt=endOfDay(new Date(`${req.query.dateTo}T00:00:00`));
  }
  const entries=await TimeClock.find(query).populate(timeClockPopulate).sort({workDate:-1,createdAt:-1});
  res.status(200).json(await decorateEntries(entries));
 }catch(error){next(error);}
};

export const updateTimeClockEntry=async(req,res,next)=>{
 try{
  const current=await TimeClock.findById(req.params.id);
  if(!current)return res.status(404).json({message:"Time clock entry not found"});
  Object.assign(current,req.body,{method:"Admin Edit"});
  current.auditTrail.push({action:"update",userName:req.body.editedBy||"Admin",note:req.body.auditNote||"Admin edit"});
  await current.save();
  const populated=await TimeClock.findById(current._id).populate(timeClockPopulate);
  const [result]=await decorateEntries([populated]);
  res.status(200).json(result);
 }catch(error){next(error);}
};

export const deleteTimeClockEntry=async(req,res,next)=>{
 try{
  const entry=await TimeClock.findByIdAndDelete(req.params.id);
  if(!entry)return res.status(404).json({message:"Time clock entry not found"});
  res.status(200).json({message:"Time clock entry deleted successfully"});
 }catch(error){next(error);}
};
