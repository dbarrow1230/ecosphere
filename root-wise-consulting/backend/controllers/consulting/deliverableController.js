//backend/controllers/consulting/deliverableController.js
import mongoose from "mongoose";
import Deliverable from "../../models/consulting/deliverableModel.js";

export const createDeliverable=async(req,res)=>{
 try{
  const{
   project,
   proposal,
   title,
   deliverableType,
   version,
   description,
   fileName,
   fileUrl,
   deliveryDate,
   approvedDate,
   clientVisible,
   status,
   revisionNotes,
   notes,
   isActive
  }=req.body;

  if(!project||!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(proposal&& !mongoose.Types.ObjectId.isValid(proposal)){
   return res.status(400).json({message:"Valid proposal is required"});
  }

  if(!title){
   return res.status(400).json({message:"Title is required"});
  }

  const deliverable=new Deliverable({
   project,
   proposal:proposal||null,
   title,
   deliverableType,
   version,
   description,
   fileName,
   fileUrl,
   deliveryDate,
   approvedDate,
   clientVisible:typeof clientVisible==="boolean"?clientVisible:true,
   status,
   revisionNotes,
   notes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const savedDeliverable=await deliverable.save();
  const populatedDeliverable=await Deliverable.findById(savedDeliverable._id)
   .populate("project")
   .populate("proposal")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populatedDeliverable);
 }catch(error){
  return res.status(500).json({message:"Error creating deliverable",error:error.message});
 }
};

export const getDeliverables=async(req,res)=>{
 try{
  const{project,proposal,deliverableType,status,isActive,clientVisible,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(proposal&&mongoose.Types.ObjectId.isValid(proposal)){
   filter.proposal=proposal;
  }
  if(deliverableType){
   filter.deliverableType=deliverableType;
  }
  if(status){
   filter.status=status;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(typeof clientVisible!=="undefined"){
   filter.clientVisible=clientVisible==="true";
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}},
    {fileName:{$regex:search,$options:"i"}},
    {revisionNotes:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const deliverables=await Deliverable.find(filter)
   .populate("project")
   .populate("proposal")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(deliverables);
 }catch(error){
  return res.status(500).json({message:"Error fetching deliverables",error:error.message});
 }
};

export const getDeliverableById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid deliverable id"});
  }

  const deliverable=await Deliverable.findById(id)
   .populate("project")
   .populate("proposal")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!deliverable){
   return res.status(404).json({message:"Deliverable not found"});
  }

  return res.status(200).json(deliverable);
 }catch(error){
  return res.status(500).json({message:"Error fetching deliverable",error:error.message});
 }
};

export const updateDeliverable=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid deliverable id"});
  }

  const{
   project,
   proposal,
   title,
   deliverableType,
   version,
   description,
   fileName,
   fileUrl,
   deliveryDate,
   approvedDate,
   clientVisible,
   status,
   revisionNotes,
   notes,
   isActive
  }=req.body;

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(typeof proposal!=="undefined"&&proposal!==null&&proposal!==""&&!mongoose.Types.ObjectId.isValid(proposal)){
   return res.status(400).json({message:"Valid proposal is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project;
  if(typeof proposal!=="undefined")updateData.proposal=proposal||null;
  if(typeof title!=="undefined")updateData.title=title;
  if(typeof deliverableType!=="undefined")updateData.deliverableType=deliverableType;
  if(typeof version!=="undefined")updateData.version=version;
  if(typeof description!=="undefined")updateData.description=description;
  if(typeof fileName!=="undefined")updateData.fileName=fileName;
  if(typeof fileUrl!=="undefined")updateData.fileUrl=fileUrl;
  if(typeof deliveryDate!=="undefined")updateData.deliveryDate=deliveryDate;
  if(typeof approvedDate!=="undefined")updateData.approvedDate=approvedDate;
  if(typeof clientVisible!=="undefined")updateData.clientVisible=clientVisible;
  if(typeof status!=="undefined")updateData.status=status;
  if(typeof revisionNotes!=="undefined")updateData.revisionNotes=revisionNotes;
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;
  updateData.updatedBy=req.user?req.user._id:null;

  const updatedDeliverable=await Deliverable.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("proposal")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updatedDeliverable){
   return res.status(404).json({message:"Deliverable not found"});
  }

  return res.status(200).json(updatedDeliverable);
 }catch(error){
  return res.status(500).json({message:"Error updating deliverable",error:error.message});
 }
};

export const deleteDeliverable=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid deliverable id"});
  }

  const deletedDeliverable=await Deliverable.findByIdAndDelete(id);

  if(!deletedDeliverable){
   return res.status(404).json({message:"Deliverable not found"});
  }

  return res.status(200).json({message:"Deliverable deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting deliverable",error:error.message});
 }
};

export const toggleDeliverableStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid deliverable id"});
  }

  const deliverable=await Deliverable.findById(id);

  if(!deliverable){
   return res.status(404).json({message:"Deliverable not found"});
  }

  deliverable.isActive=!deliverable.isActive;
  deliverable.updatedBy=req.user?req.user._id:null;

  await deliverable.save();

  const populatedDeliverable=await Deliverable.findById(deliverable._id)
   .populate("project")
   .populate("proposal")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populatedDeliverable);
 }catch(error){
  return res.status(500).json({message:"Error updating deliverable status",error:error.message});
 }
};