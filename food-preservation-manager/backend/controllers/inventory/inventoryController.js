import Inventory from "../../models/inventory/inventoryModel.js";

const populateInventory=query=>query
 .populate("product")
 .populate("productBatch")
 .populate("storageLocation")
 .populate("workflowStatus");

const normalizeInventoryPayload=body=>({
 ...body,
 name:String(body?.name||"").trim(),
 category:String(body?.category||"").trim(),
 sku:String(body?.sku||"").trim(),
 quantityOnHand:Number(body?.quantityOnHand??body?.quantities?.onHand??0),
 reorderLevel:Number(body?.reorderLevel||0),
 unit:String(body?.unit||"").trim(),
 costPerUnit:Number(body?.costPerUnit||0),
 supplier:String(body?.supplier||"").trim(),
 status:["low","out-of-stock","discontinued"].includes(String(body?.status||"").trim().toLowerCase())
  ?String(body.status).trim().toLowerCase()
  :"in-stock",
 product:body?.product||null,
 productBatch:body?.productBatch||null,
 workflowStatus:body?.workflowStatus||null,
 quantities:{
  ...(body?.quantities||{}),
  onHand:Number(body?.quantityOnHand??body?.quantities?.onHand??0)
 },
 notes:String(body?.notes||"").trim()
});

const buildQuery=query=>{
 const q={};
 if(query.product)q.product=query.product;
 if(query.productBatch)q.productBatch=query.productBatch;
 if(query.storageLocation)q.storageLocation=query.storageLocation;
 if(query.status)q.status=query.status;
 return q;
};

export const getInventoryItems=async(req,res)=>{
 try{
  const items=await populateInventory(Inventory.find(buildQuery(req.query))).sort({createdAt:-1});
  return res.status(200).json({success:true,count:items.length,data:items,inventory:items});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch inventory"});
 }
};

export const getInventoryItemById=async(req,res)=>{
 try{
  const item=await populateInventory(Inventory.findById(req.params.id));
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});
  return res.status(200).json({success:true,data:item,inventoryItem:item});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch inventory item"});
 }
};

export const createInventoryItem=async(req,res)=>{
 try{
  const item=await Inventory.create(normalizeInventoryPayload(req.body));
  const populated=await populateInventory(Inventory.findById(item._id));
  return res.status(201).json({success:true,message:"Inventory item created",data:populated,inventoryItem:populated});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create inventory item"});
 }
};

export const updateInventoryItem=async(req,res)=>{
 try{
  const item=await populateInventory(Inventory.findByIdAndUpdate(req.params.id,normalizeInventoryPayload(req.body),{returnDocument:"after",runValidators:true}));
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});
  return res.status(200).json({success:true,message:"Inventory item updated",data:item,inventoryItem:item});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update inventory item"});
 }
};

export const deleteInventoryItem=async(req,res)=>{
 try{
  const item=await Inventory.findByIdAndDelete(req.params.id);
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});
  return res.status(200).json({success:true,message:"Inventory item deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete inventory item"});
 }
};

