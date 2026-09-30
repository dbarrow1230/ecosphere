// backend/controllers/kitchenPrepController.js
import KitchenPrep from "../models/kitchenPrepModel.js";

const buildPopulate=[
 {path:"event",select:"eventName clientName eventDate eventTime status location"},
 {path:"order",select:"orderNumber status serviceType total"},
 {path:"menu",select:"name category status"},
 {path:"menuItem",select:"name category price"},
 {path:"station",select:"name code description active sortOrder"},
 {path:"assignedTo",select:"username email firstName lastName"}
];

export const getKitchenPrep=async(req,res)=>{
 try{
  const filter={};

  if(req.query.event) filter.event=req.query.event;
  if(req.query.order) filter.order=req.query.order;
  if(req.query.menu) filter.menu=req.query.menu;
  if(req.query.menuItem) filter.menuItem=req.query.menuItem;
  if(req.query.station) filter.station=req.query.station;
  if(req.query.status) filter.status=req.query.status;
  if(req.query.priority) filter.priority=req.query.priority;
  if(req.query.assignedTo) filter.assignedTo=req.query.assignedTo;

  const kitchenPrep=await KitchenPrep.find(filter).populate(buildPopulate).sort({dueDate:1,createdAt:-1});

  res.status(200).json({success:true,count:kitchenPrep.length,kitchenPrep});
 }catch(err){
  console.error("Error fetching kitchen prep:",err);
  res.status(500).json({success:false,message:"Failed to fetch kitchen prep."});
 }
};

export const getKitchenPrepById=async(req,res)=>{
 try{
  const kitchenPrep=await KitchenPrep.findById(req.params.id).populate(buildPopulate);

  if(!kitchenPrep){
   return res.status(404).json({success:false,message:"Kitchen prep item not found."});
  }

  res.status(200).json({success:true,kitchenPrep});
 }catch(err){
  console.error("Error fetching kitchen prep item:",err);
  res.status(500).json({success:false,message:"Failed to fetch kitchen prep item."});
 }
};

export const createKitchenPrep=async(req,res)=>{
 try{
  const payload={
   event:req.body.event,
   order:req.body.order||null,
   menu:req.body.menu||null,
   menuItem:req.body.menuItem||null,
   dishName:req.body.dishName||"",
   prepItem:req.body.prepItem,
   station:req.body.station,
   quantity:Number(req.body.quantity||0),
   unit:req.body.unit||"",
   priority:req.body.priority||"normal",
   status:req.body.status||"pending",
   assignedTo:req.body.assignedTo||null,
   dueDate:req.body.dueDate||null,
   completedAt:req.body.completedAt||null,
   notes:req.body.notes||""
  };

  const kitchenPrep=await KitchenPrep.create(payload);
  const savedKitchenPrep=await KitchenPrep.findById(kitchenPrep._id).populate(buildPopulate);

  res.status(201).json({success:true,message:"Kitchen prep item created successfully.",kitchenPrep:savedKitchenPrep});
 }catch(err){
  console.error("Error creating kitchen prep item:",err);
  res.status(500).json({success:false,message:"Failed to create kitchen prep item."});
 }
};

export const updateKitchenPrep=async(req,res)=>{
 try{
  const payload={
   event:req.body.event,
   order:req.body.order||null,
   menu:req.body.menu||null,
   menuItem:req.body.menuItem||null,
   dishName:req.body.dishName||"",
   prepItem:req.body.prepItem,
   station:req.body.station,
   quantity:Number(req.body.quantity||0),
   unit:req.body.unit||"",
   priority:req.body.priority||"normal",
   status:req.body.status||"pending",
   assignedTo:req.body.assignedTo||null,
   dueDate:req.body.dueDate||null,
   completedAt:req.body.completedAt||null,
   notes:req.body.notes||""
  };

  const kitchenPrep=await KitchenPrep.findByIdAndUpdate(req.params.id,payload,{returnDocument:"after",runValidators:true}).populate(buildPopulate);

  if(!kitchenPrep){
   return res.status(404).json({success:false,message:"Kitchen prep item not found."});
  }

  res.status(200).json({success:true,message:"Kitchen prep item updated successfully.",kitchenPrep});
 }catch(err){
  console.error("Error updating kitchen prep item:",err);
  res.status(500).json({success:false,message:"Failed to update kitchen prep item."});
 }
};

export const deleteKitchenPrep=async(req,res)=>{
 try{
  const kitchenPrep=await KitchenPrep.findByIdAndDelete(req.params.id);

  if(!kitchenPrep){
   return res.status(404).json({success:false,message:"Kitchen prep item not found."});
  }

  res.status(200).json({success:true,message:"Kitchen prep item deleted successfully."});
 }catch(err){
  console.error("Error deleting kitchen prep item:",err);
  res.status(500).json({success:false,message:"Failed to delete kitchen prep item."});
 }
};