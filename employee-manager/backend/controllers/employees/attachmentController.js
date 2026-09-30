// backend/controllers/employees/attachmentController.js
import Attachment from "../../models/employees/attachmentModel.js";

const attachmentPopulate=[{path:"employeeRef",model:"Employee"}];

export const createAttachment=async(req,res,next)=>{
 try{
  const attachment=await Attachment.create(req.body);
  const result=await Attachment.findById(attachment._id).populate(attachmentPopulate);
  res.status(201).json(result);
 }catch(error){
  next(error);
 }
};

export const getAttachments=async(req,res,next)=>{
 try{
  const attachments=await Attachment.find().populate(attachmentPopulate).sort({addedOn:-1});
  res.status(200).json(attachments);
 }catch(error){
  next(error);
 }
};

export const deleteAttachment=async(req,res,next)=>{
 try{
  const attachment=await Attachment.findByIdAndDelete(req.params.id);
  if(!attachment)return res.status(404).json({message:"Attachment not found"});
  res.status(200).json({message:"Attachment deleted successfully"});
 }catch(error){
  next(error);
 }
};
