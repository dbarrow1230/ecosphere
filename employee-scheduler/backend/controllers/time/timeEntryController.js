// backend/controllers/time/timeEntryController.js
import TimeEntry from "../../models/time/timeEntryModel.js";

export const createTimeEntry=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee,
   shift:req.body.shift||null,
   shiftLocation:req.body.shiftLocation||null,
   workDate:req.body.workDate,
   scheduledStart:req.body.scheduledStart||null,
   scheduledEnd:req.body.scheduledEnd||null,
   scheduledMinutes:req.body.scheduledMinutes!==undefined?req.body.scheduledMinutes:0,
   clockIn:req.body.clockIn||null,
   clockOut:req.body.clockOut||null,
   breaks:Array.isArray(req.body.breaks)?req.body.breaks:[],
   totalBreakMinutes:req.body.totalBreakMinutes!==undefined?req.body.totalBreakMinutes:0,
   totalPaidBreakMinutes:req.body.totalPaidBreakMinutes!==undefined?req.body.totalPaidBreakMinutes:0,
   totalUnpaidBreakMinutes:req.body.totalUnpaidBreakMinutes!==undefined?req.body.totalUnpaidBreakMinutes:0,
   totalWorkedMinutes:req.body.totalWorkedMinutes!==undefined?req.body.totalWorkedMinutes:0,
   regularWorkedMinutes:req.body.regularWorkedMinutes!==undefined?req.body.regularWorkedMinutes:0,
   overtimeMinutes:req.body.overtimeMinutes!==undefined?req.body.overtimeMinutes:0,
   earlyInMinutes:req.body.earlyInMinutes!==undefined?req.body.earlyInMinutes:0,
   lateInMinutes:req.body.lateInMinutes!==undefined?req.body.lateInMinutes:0,
   earlyOutMinutes:req.body.earlyOutMinutes!==undefined?req.body.earlyOutMinutes:0,
   lateOutMinutes:req.body.lateOutMinutes!==undefined?req.body.lateOutMinutes:0,
   overtimeStatus:req.body.overtimeStatus||"none",
   approvedOvertimeMinutes:req.body.approvedOvertimeMinutes!==undefined?req.body.approvedOvertimeMinutes:0,
   overtimeApprovedBy:req.body.overtimeApprovedBy||null,
   overtimeApprovedAt:req.body.overtimeApprovedAt||null,
   payroll:req.body.payroll||null,
   payrollStatus:req.body.payrollStatus||"unprocessed",
   payrollProcessedAt:req.body.payrollProcessedAt||null,
   payrollProcessedBy:req.body.payrollProcessedBy||null,
   hourlyRateSnapshot:req.body.hourlyRateSnapshot!==undefined?req.body.hourlyRateSnapshot:0,
   overtimeRateSnapshot:req.body.overtimeRateSnapshot!==undefined?req.body.overtimeRateSnapshot:0,
   regularPayAmount:req.body.regularPayAmount!==undefined?req.body.regularPayAmount:0,
   overtimePayAmount:req.body.overtimePayAmount!==undefined?req.body.overtimePayAmount:0,
   grossPayAmount:req.body.grossPayAmount!==undefined?req.body.grossPayAmount:0,
   status:req.body.status||"active",
   notes:Array.isArray(req.body.notes)?req.body.notes:[],
   actions:Array.isArray(req.body.actions)?req.body.actions:[],
  };

  if(!payload.business||!payload.employee||!payload.workDate){
   return res.status(400).json({message:"business, employee, and workDate are required"});
  }

  const timeEntry=await TimeEntry.create(payload);

  const populatedTimeEntry=await TimeEntry.findById(timeEntry._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("shift","title shiftDate startTime endTime")
   .populate("shiftLocation","name code")
   .populate("overtimeApprovedBy","username name email")
   .populate("payroll","payPeriodStart payPeriodEnd payDate status")
   .populate("payrollProcessedBy","username name email")
   .populate("actions.createdBy","username name email");

  res.status(201).json({
   message:"Time entry created successfully",
   data:populatedTimeEntry
  });
 }catch(err){
  res.status(500).json({message:"Failed to create time entry",error:err.message});
 }
};

export const getTimeEntries=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.shift)query.shift=req.query.shift;
  if(req.query.shiftLocation)query.shiftLocation=req.query.shiftLocation;
  if(req.query.payroll)query.payroll=req.query.payroll;
  if(req.query.payrollStatus)query.payrollStatus=req.query.payrollStatus;
  if(req.query.status)query.status=req.query.status;
  if(req.query.overtimeStatus)query.overtimeStatus=req.query.overtimeStatus;

  if(req.query.workDateFrom||req.query.workDateTo){
   query.workDate={};
   if(req.query.workDateFrom)query.workDate.$gte=new Date(req.query.workDateFrom);
   if(req.query.workDateTo)query.workDate.$lte=new Date(req.query.workDateTo);
   if(!Object.keys(query.workDate).length)delete query.workDate;
  }

  if(req.query.startDate||req.query.endDate){
   query.workDate={};
   if(req.query.startDate)query.workDate.$gte=new Date(req.query.startDate);
   if(req.query.endDate)query.workDate.$lte=new Date(req.query.endDate);
   if(!Object.keys(query.workDate).length)delete query.workDate;
  }

  const timeEntries=await TimeEntry.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("shift","title shiftDate startTime endTime")
   .populate("shiftLocation","name code")
   .populate("overtimeApprovedBy","username name email")
   .populate("payroll","payPeriodStart payPeriodEnd payDate status")
   .populate("payrollProcessedBy","username name email")
   .populate("actions.createdBy","username name email")
   .sort({workDate:-1,createdAt:-1});

  res.status(200).json({
   message:"Time entries fetched successfully",
   data:timeEntries
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time entries",error:err.message});
 }
};

export const getTimeEntryById=async(req,res)=>{
 try{
  const timeEntry=await TimeEntry.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("shift","title shiftDate startTime endTime")
   .populate("shiftLocation","name code")
   .populate("overtimeApprovedBy","username name email")
   .populate("payroll","payPeriodStart payPeriodEnd payDate status")
   .populate("payrollProcessedBy","username name email")
   .populate("actions.createdBy","username name email");

  if(!timeEntry){
   return res.status(404).json({message:"Time entry not found"});
  }

  res.status(200).json({
   message:"Time entry fetched successfully",
   data:timeEntry
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch time entry",error:err.message});
 }
};

export const updateTimeEntry=async(req,res)=>{
 try{
  const existing=await TimeEntry.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Time entry not found"});
  }

  const timeEntry=await TimeEntry.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     shift:req.body.shift!==undefined?req.body.shift:existing.shift,
     shiftLocation:req.body.shiftLocation!==undefined?req.body.shiftLocation:existing.shiftLocation,
     workDate:req.body.workDate!==undefined?req.body.workDate:existing.workDate,
     scheduledStart:req.body.scheduledStart!==undefined?req.body.scheduledStart:existing.scheduledStart,
     scheduledEnd:req.body.scheduledEnd!==undefined?req.body.scheduledEnd:existing.scheduledEnd,
     scheduledMinutes:req.body.scheduledMinutes!==undefined?req.body.scheduledMinutes:existing.scheduledMinutes,
     clockIn:req.body.clockIn!==undefined?req.body.clockIn:existing.clockIn,
     clockOut:req.body.clockOut!==undefined?req.body.clockOut:existing.clockOut,
     breaks:req.body.breaks!==undefined?req.body.breaks:existing.breaks,
     totalBreakMinutes:req.body.totalBreakMinutes!==undefined?req.body.totalBreakMinutes:existing.totalBreakMinutes,
     totalPaidBreakMinutes:req.body.totalPaidBreakMinutes!==undefined?req.body.totalPaidBreakMinutes:existing.totalPaidBreakMinutes,
     totalUnpaidBreakMinutes:req.body.totalUnpaidBreakMinutes!==undefined?req.body.totalUnpaidBreakMinutes:existing.totalUnpaidBreakMinutes,
     totalWorkedMinutes:req.body.totalWorkedMinutes!==undefined?req.body.totalWorkedMinutes:existing.totalWorkedMinutes,
     regularWorkedMinutes:req.body.regularWorkedMinutes!==undefined?req.body.regularWorkedMinutes:existing.regularWorkedMinutes,
     overtimeMinutes:req.body.overtimeMinutes!==undefined?req.body.overtimeMinutes:existing.overtimeMinutes,
     earlyInMinutes:req.body.earlyInMinutes!==undefined?req.body.earlyInMinutes:existing.earlyInMinutes,
     lateInMinutes:req.body.lateInMinutes!==undefined?req.body.lateInMinutes:existing.lateInMinutes,
     earlyOutMinutes:req.body.earlyOutMinutes!==undefined?req.body.earlyOutMinutes:existing.earlyOutMinutes,
     lateOutMinutes:req.body.lateOutMinutes!==undefined?req.body.lateOutMinutes:existing.lateOutMinutes,
     overtimeStatus:req.body.overtimeStatus!==undefined?req.body.overtimeStatus:existing.overtimeStatus,
     approvedOvertimeMinutes:req.body.approvedOvertimeMinutes!==undefined?req.body.approvedOvertimeMinutes:existing.approvedOvertimeMinutes,
     overtimeApprovedBy:req.body.overtimeApprovedBy!==undefined?req.body.overtimeApprovedBy:existing.overtimeApprovedBy,
     overtimeApprovedAt:req.body.overtimeApprovedAt!==undefined?req.body.overtimeApprovedAt:existing.overtimeApprovedAt,
     payroll:req.body.payroll!==undefined?req.body.payroll:existing.payroll,
     payrollStatus:req.body.payrollStatus!==undefined?req.body.payrollStatus:existing.payrollStatus,
     payrollProcessedAt:req.body.payrollProcessedAt!==undefined?req.body.payrollProcessedAt:existing.payrollProcessedAt,
     payrollProcessedBy:req.body.payrollProcessedBy!==undefined?req.body.payrollProcessedBy:existing.payrollProcessedBy,
     hourlyRateSnapshot:req.body.hourlyRateSnapshot!==undefined?req.body.hourlyRateSnapshot:existing.hourlyRateSnapshot,
     overtimeRateSnapshot:req.body.overtimeRateSnapshot!==undefined?req.body.overtimeRateSnapshot:existing.overtimeRateSnapshot,
     regularPayAmount:req.body.regularPayAmount!==undefined?req.body.regularPayAmount:existing.regularPayAmount,
     overtimePayAmount:req.body.overtimePayAmount!==undefined?req.body.overtimePayAmount:existing.overtimePayAmount,
     grossPayAmount:req.body.grossPayAmount!==undefined?req.body.grossPayAmount:existing.grossPayAmount,
     status:req.body.status!==undefined?req.body.status:existing.status,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes,
     actions:req.body.actions!==undefined?req.body.actions:existing.actions
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("shift","title shiftDate startTime endTime")
   .populate("shiftLocation","name code")
   .populate("overtimeApprovedBy","username name email")
   .populate("payroll","payPeriodStart payPeriodEnd payDate status")
   .populate("payrollProcessedBy","username name email")
   .populate("actions.createdBy","username name email");

  res.status(200).json({
   message:"Time entry updated successfully",
   data:timeEntry
  });
 }catch(err){
  res.status(500).json({message:"Failed to update time entry",error:err.message});
 }
};

export const deleteTimeEntry=async(req,res)=>{
 try{
  const timeEntry=await TimeEntry.findByIdAndDelete(req.params.id);

  if(!timeEntry){
   return res.status(404).json({message:"Time entry not found"});
  }

  res.status(200).json({
   message:"Time entry deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete time entry",error:err.message});
 }
};