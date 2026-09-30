import mongoose from "mongoose";
import Reminder from "../models/reminderModel.js";
import {generateRecordId,toCode,toSubjectCode} from "../utils/recordId.js";

const getUserId=req=>{
  const userId=req.user?._id||req.body?.userId||req.body?.user||req.query?.userId||"";
  return mongoose.isValidObjectId(userId)?String(userId):"";
};

const normalizeObjectIds=value=>{
  if(!Array.isArray(value))return [];
  return value.map(item=>String(item?._id||item||"")).filter(item=>mongoose.isValidObjectId(item));
};

const buildReminderPayload=(body,userId)=>({
  title:String(body.title||"").trim(),
  message:String(body.message||"").trim(),
  reminderType:String(body.reminderType||"custom").trim().toLowerCase(),
  parentModel:String(body.parentModel||"User").trim(),
  parentRecordId:mongoose.isValidObjectId(body.parentRecordId)?body.parentRecordId:userId,
  parentDisplayId:String(body.parentDisplayId||body.parentLabel||"Personal reminder").trim(),
  audienceType:body.audienceType==="all"?"all":"selected",
  selectedUsers:normalizeObjectIds(body.selectedUsers).length?normalizeObjectIds(body.selectedUsers):[userId],
  channels:{
    inApp:body.channels?.inApp!==false,
    email:Boolean(body.channels?.email)
  },
  sendAt:body.sendAt||null,
  isRecurring:Boolean(body.isRecurring),
  recurrenceRule:body.isRecurring?String(body.recurrenceRule||"").trim().toLowerCase():"",
  recurrenceEndAt:body.recurrenceEndAt||null,
  reminderOffsetMinutes:Number(body.reminderOffsetMinutes??0),
  modalDismissedBy:normalizeObjectIds(body.modalDismissedBy)
});

export const getReminders = async (req, res) => {
  try {
    const userId = getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
    const { status, reminderType, parentModel, parentRecordId } = req.query;

    const filter = { userId };
    if (status) filter.status = status;
    if (reminderType) filter.reminderType = reminderType;
    if (parentModel) filter.parentModel = parentModel;
    if (parentRecordId) filter.parentRecordId = parentRecordId;

    const reminders = await Reminder.find(filter).sort({ sendAt: 1 });
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReminderById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
    const reminder = await Reminder.findOne({ _id: req.params.id, userId });

    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const userId=getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});

    const payload=buildReminderPayload(req.body,userId);
    if(!payload.title)return res.status(400).json({success:false,message:"Reminder title is required"});
    if(!payload.sendAt||Number.isNaN(new Date(payload.sendAt).getTime()))return res.status(400).json({success:false,message:"A valid send date and time are required"});
    if(new Date(payload.sendAt).getTime()<=Date.now())return res.status(400).json({success:false,message:"Reminder date and time must be in the future. Check AM or PM."});

    const reminderId=await generateRecordId({
      userId,
      recordType:"REM",
      projectCode:toCode(req.body.projectCode||"GENERAL"),
      subtype:payload.reminderType,
      subjectCode:toSubjectCode(payload.title)
    });

    const reminder=await Reminder.create({...payload,userId,reminderId,status:"pending"});

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const userId=getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
    const existing=await Reminder.findOne({_id:req.params.id,userId});
    if(!existing)return res.status(404).json({success:false,message:"Reminder not found"});
    const updates=buildReminderPayload(req.body,userId);

    const sendAtChanged=new Date(existing.sendAt).getTime()!==new Date(updates.sendAt).getTime();
    const existingRecurrenceEnd=existing.recurrenceEndAt?new Date(existing.recurrenceEndAt).getTime():null;
    const updatedRecurrenceEnd=updates.recurrenceEndAt?new Date(updates.recurrenceEndAt).getTime():null;
    const recurrenceChanged=
      existing.isRecurring!==updates.isRecurring||
      existing.recurrenceRule!==updates.recurrenceRule||
      existingRecurrenceEnd!==updatedRecurrenceEnd;

    if(sendAtChanged||recurrenceChanged){
      if(sendAtChanged&&new Date(updates.sendAt).getTime()<=Date.now()){
        return res.status(400).json({success:false,message:"Reminder date and time must be in the future. Check AM or PM."});
      }
      updates.nextRunAt=updates.isRecurring?updates.sendAt:null;
      updates.status="pending";
      updates.sentAt=null;
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { returnDocument:"after", runValidators: true }
    );
    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const dismissReminder = async (req, res) => {
  try {
    const userId=getUserId(req);

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId },
      { dismissedAt: new Date() },
      { returnDocument:"after" }
    );

    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const archiveReminder = async (req, res) => {
  try {
    const userId=getUserId(req);

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: "archived" },
      { returnDocument:"after" }
    );

    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const pauseReminder=async(req,res)=>{
  try{
    const userId=getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
    const reminder=await Reminder.findOneAndUpdate(
      {_id:req.params.id,userId,status:{$in:["pending","failed"]}},
      {status:"paused"},
      {returnDocument:"after",runValidators:true}
    );
    if(!reminder)return res.status(409).json({success:false,message:"Only pending or failed reminders can be paused"});
    return res.json({success:true,message:"Reminder paused",data:reminder});
  }catch(error){
    return res.status(400).json({success:false,message:error.message});
  }
};

export const resumeReminder=async(req,res)=>{
  try{
    const userId=getUserId(req);
    if(!userId)return res.status(400).json({success:false,message:"A valid user is required"});
    const reminder=await Reminder.findOneAndUpdate(
      {_id:req.params.id,userId,status:"paused"},
      {status:"pending"},
      {returnDocument:"after",runValidators:true}
    );
    if(!reminder)return res.status(409).json({success:false,message:"Only paused reminders can be resumed"});
    return res.json({success:true,message:"Reminder resumed",data:reminder});
  }catch(error){
    return res.status(400).json({success:false,message:error.message});
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const userId=getUserId(req);
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId });

    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    res.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
