// backend/services/notificationService.js
import Notification from "../models/notifications/notificationModel.js";

export const createNotification=async(payload)=>{
 return Notification.create(payload);
};

export const markAsRead=async(notificationId)=>{
 const notification=await Notification.findById(notificationId);
 if(!notification)throw new Error("Notification not found.");

 notification.isRead=true;
 notification.readAt=new Date();
 await notification.save();

 return notification;
};

export default {
 createNotification,
 markAsRead
};