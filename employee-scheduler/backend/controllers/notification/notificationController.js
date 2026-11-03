// backend/controllers/notifications/notificationController.js
import Notification from "../../models/notification/notificationModel.js";

export const createNotification=async(req,res)=>{
 try{
  const payload={
   business:req.body.business,
   employee:req.body.employee||null,
   user:req.body.user||null,
   type:req.body.type||"general",
   title:req.body.title||"",
   message:req.body.message||"",
   entityType:req.body.entityType||"",
   entityId:req.body.entityId||null,
   isRead:req.body.isRead!==undefined?req.body.isRead:false,
   readAt:req.body.readAt||null,
   status:req.body.status||"active",
   notes:Array.isArray(req.body.notes)?req.body.notes:[]
  };

  if(!payload.business){
   return res.status(400).json({message:"business is required"});
  }

  const notification=await Notification.create(payload);

  const populatedNotification=await Notification.findById(notification._id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  res.status(201).json({
   message:"Notification created successfully",
   data:populatedNotification
  });
 }catch(err){
  res.status(500).json({message:"Failed to create notification",error:err.message});
 }
};

export const getNotifications=async(req,res)=>{
 try{
  const query={};

  if(req.query.business)query.business=req.query.business;
  if(req.query.employee)query.employee=req.query.employee;
  if(req.query.user)query.user=req.query.user;
  if(req.query.type)query.type=req.query.type;
  if(req.query.status)query.status=req.query.status;
  if(req.query.isRead!==undefined)query.isRead=req.query.isRead==="true";
  if(req.query.entityType)query.entityType=req.query.entityType;
  if(req.query.entityId)query.entityId=req.query.entityId;

  if(req.query.search){
   const value=req.query.search.trim();
   query.$or=[
    {title:{$regex:value,$options:"i"}},
    {message:{$regex:value,$options:"i"}},
    {type:{$regex:value,$options:"i"}}
   ];
  }

  const notifications=await Notification.find(query)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email")
   .sort({createdAt:-1});

  res.status(200).json({
   message:"Notifications fetched successfully",
   data:notifications
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch notifications",error:err.message});
 }
};

export const getNotificationById=async(req,res)=>{
 try{
  const notification=await Notification.findById(req.params.id)
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  if(!notification){
   return res.status(404).json({message:"Notification not found"});
  }

  res.status(200).json({
   message:"Notification fetched successfully",
   data:notification
  });
 }catch(err){
  res.status(500).json({message:"Failed to fetch notification",error:err.message});
 }
};

export const updateNotification=async(req,res)=>{
 try{
  const existing=await Notification.findById(req.params.id);

  if(!existing){
   return res.status(404).json({message:"Notification not found"});
  }

  const notification=await Notification.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     business:req.body.business!==undefined?req.body.business:existing.business,
     employee:req.body.employee!==undefined?req.body.employee:existing.employee,
     user:req.body.user!==undefined?req.body.user:existing.user,
     type:req.body.type!==undefined?req.body.type:existing.type,
     title:req.body.title!==undefined?req.body.title:existing.title,
     message:req.body.message!==undefined?req.body.message:existing.message,
     entityType:req.body.entityType!==undefined?req.body.entityType:existing.entityType,
     entityId:req.body.entityId!==undefined?req.body.entityId:existing.entityId,
     isRead:req.body.isRead!==undefined?req.body.isRead:existing.isRead,
     readAt:req.body.readAt!==undefined?req.body.readAt:existing.readAt,
     status:req.body.status!==undefined?req.body.status:existing.status,
     notes:req.body.notes!==undefined?req.body.notes:existing.notes
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  res.status(200).json({
   message:"Notification updated successfully",
   data:notification
  });
 }catch(err){
  res.status(500).json({message:"Failed to update notification",error:err.message});
 }
};

export const markNotificationAsRead=async(req,res)=>{
 try{
  const notification=await Notification.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     isRead:true,
     readAt:new Date()
    }
   },
   {returnDocument:"after",runValidators:true}
  )
   .populate("business","name")
   .populate("employee","firstName lastName employeeId")
   .populate("user","username name email");

  if(!notification){
   return res.status(404).json({message:"Notification not found"});
  }

  res.status(200).json({
   message:"Notification marked as read successfully",
   data:notification
  });
 }catch(err){
  res.status(500).json({message:"Failed to mark notification as read",error:err.message});
 }
};

export const markAllNotificationsAsRead=async(req,res)=>{
 try{
  const query={isRead:false};

  if(req.body.business)query.business=req.body.business;
  if(req.body.employee)query.employee=req.body.employee;
  if(req.body.user)query.user=req.body.user;
  if(req.body.status)query.status=req.body.status;

  if(!query.business){
   return res.status(400).json({message:"business is required"});
  }

  await Notification.updateMany(
   query,
   {
    $set:{
     isRead:true,
     readAt:new Date()
    }
   }
  );

  res.status(200).json({
   message:"Notifications marked as read successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to mark notifications as read",error:err.message});
 }
};

export const deleteNotification=async(req,res)=>{
 try{
  const notification=await Notification.findByIdAndDelete(req.params.id);

  if(!notification){
   return res.status(404).json({message:"Notification not found"});
  }

  res.status(200).json({
   message:"Notification deleted successfully"
  });
 }catch(err){
  res.status(500).json({message:"Failed to delete notification",error:err.message});
 }
};