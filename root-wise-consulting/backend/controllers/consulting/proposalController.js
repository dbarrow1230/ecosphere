//backend/controllers/consulting/proposalController.js
import mongoose from "mongoose";
import Proposal from "../../models/consulting/proposalModel.js";

export const createProposal=async(req,res)=>{
 try{
  const{
   project,
   proposalNumber,
   version,
   title,
   scope,
   deliverables,
   assumptions,
   lineItems,
   subtotal,
   discount,
   total,
   paymentTerms,
   depositRequired,
   validUntil,
   status,
   sentAt,
   acceptedAt,
   rejectedAt,
   notes,
   isActive
  }=req.body;

  if(!project||!mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  if(!title){
   return res.status(400).json({message:"Title is required"});
  }

  const proposal=new Proposal({
   project,
   proposalNumber,
   version,
   title,
   scope,
   deliverables:Array.isArray(deliverables)?deliverables:[],
   assumptions:Array.isArray(assumptions)?assumptions:[],
   lineItems:Array.isArray(lineItems)?lineItems:[],
   subtotal,
   discount,
   total,
   paymentTerms,
   depositRequired,
   validUntil,
   status,
   sentAt,
   acceptedAt,
   rejectedAt,
   notes,
   isActive:typeof isActive==="boolean"?isActive:true,
   createdBy:req.user?req.user._id:null,
   updatedBy:req.user?req.user._id:null
  });

  const saved=await proposal.save();

  const populated=await Proposal.findById(saved._id)
   .populate("project")
   .populate("lineItems.service")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(201).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error creating proposal",error:error.message});
 }
};

export const getProposals=async(req,res)=>{
 try{
  const{project,status,isActive,search}=req.query;

  const filter={};

  if(project&&mongoose.Types.ObjectId.isValid(project)){
   filter.project=project;
  }
  if(status){
   filter.status=status;
  }
  if(typeof isActive!=="undefined"){
   filter.isActive=isActive==="true";
  }
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {proposalNumber:{$regex:search,$options:"i"}},
    {scope:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}},
    {"lineItems.title":{$regex:search,$options:"i"}},
    {"lineItems.description":{$regex:search,$options:"i"}}
   ];
  }

  const proposals=await Proposal.find(filter)
   .populate("project")
   .populate("lineItems.service")
   .populate("createdBy","name email")
   .populate("updatedBy","name email")
   .sort({createdAt:-1});

  return res.status(200).json(proposals);
 }catch(error){
  return res.status(500).json({message:"Error fetching proposals",error:error.message});
 }
};

export const getProposalById=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid proposal id"});
  }

  const proposal=await Proposal.findById(id)
   .populate("project")
   .populate("lineItems.service")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!proposal){
   return res.status(404).json({message:"Proposal not found"});
  }

  return res.status(200).json(proposal);
 }catch(error){
  return res.status(500).json({message:"Error fetching proposal",error:error.message});
 }
};

export const updateProposal=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid proposal id"});
  }

  const{
   project,
   proposalNumber,
   version,
   title,
   scope,
   deliverables,
   assumptions,
   lineItems,
   subtotal,
   discount,
   total,
   paymentTerms,
   depositRequired,
   validUntil,
   status,
   sentAt,
   acceptedAt,
   rejectedAt,
   notes,
   isActive
  }=req.body;

  if(project&& !mongoose.Types.ObjectId.isValid(project)){
   return res.status(400).json({message:"Valid project is required"});
  }

  const updateData={};

  if(typeof project!=="undefined")updateData.project=project;
  if(typeof proposalNumber!=="undefined")updateData.proposalNumber=proposalNumber;
  if(typeof version!=="undefined")updateData.version=version;
  if(typeof title!=="undefined")updateData.title=title;
  if(typeof scope!=="undefined")updateData.scope=scope;
  if(typeof deliverables!=="undefined")updateData.deliverables=Array.isArray(deliverables)?deliverables:[];
  if(typeof assumptions!=="undefined")updateData.assumptions=Array.isArray(assumptions)?assumptions:[];
  if(typeof lineItems!=="undefined")updateData.lineItems=Array.isArray(lineItems)?lineItems:[];
  if(typeof subtotal!=="undefined")updateData.subtotal=subtotal;
  if(typeof discount!=="undefined")updateData.discount=discount;
  if(typeof total!=="undefined")updateData.total=total;
  if(typeof paymentTerms!=="undefined")updateData.paymentTerms=paymentTerms;
  if(typeof depositRequired!=="undefined")updateData.depositRequired=depositRequired;
  if(typeof validUntil!=="undefined")updateData.validUntil=validUntil;
  if(typeof status!=="undefined")updateData.status=status;
  if(typeof sentAt!=="undefined")updateData.sentAt=sentAt;
  if(typeof acceptedAt!=="undefined")updateData.acceptedAt=acceptedAt;
  if(typeof rejectedAt!=="undefined")updateData.rejectedAt=rejectedAt;
  if(typeof notes!=="undefined")updateData.notes=notes;
  if(typeof isActive!=="undefined")updateData.isActive=isActive;

  updateData.updatedBy=req.user?req.user._id:null;

  const updated=await Proposal.findByIdAndUpdate(
   id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("project")
   .populate("lineItems.service")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  if(!updated){
   return res.status(404).json({message:"Proposal not found"});
  }

  return res.status(200).json(updated);
 }catch(error){
  return res.status(500).json({message:"Error updating proposal",error:error.message});
 }
};

export const deleteProposal=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid proposal id"});
  }

  const deleted=await Proposal.findByIdAndDelete(id);

  if(!deleted){
   return res.status(404).json({message:"Proposal not found"});
  }

  return res.status(200).json({message:"Proposal deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Error deleting proposal",error:error.message});
 }
};

export const toggleProposalStatus=async(req,res)=>{
 try{
  const{id}=req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
   return res.status(400).json({message:"Invalid proposal id"});
  }

  const proposal=await Proposal.findById(id);

  if(!proposal){
   return res.status(404).json({message:"Proposal not found"});
  }

  proposal.isActive=!proposal.isActive;
  proposal.updatedBy=req.user?req.user._id:null;

  await proposal.save();

  const populated=await Proposal.findById(proposal._id)
   .populate("project")
   .populate("lineItems.service")
   .populate("createdBy","name email")
   .populate("updatedBy","name email");

  return res.status(200).json(populated);
 }catch(error){
  return res.status(500).json({message:"Error updating proposal status",error:error.message});
 }
};