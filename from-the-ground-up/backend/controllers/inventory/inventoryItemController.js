import mongoose from "mongoose";
import InventoryItem from "../../models/inventory/inventoryItemModel.js";

const isValidObjectId=id=>mongoose.Types.ObjectId.isValid(id);

const normalizePayload=body=>({
 business:body.business||body.business_id||null,
 business_id:body.business_id||body.business||null,
 name:String(body.name||"").trim(),
 category:String(body.category||"").trim(),
 sku:String(body.sku||"").trim(),
 quantityOnHand:Number(body.quantityOnHand||0),
 reorderLevel:Number(body.reorderLevel||0),
 unit:String(body.unit||"").trim(),
 costPerUnit:Number(body.costPerUnit||0),
 supplier:String(body.supplier||"").trim(),
 status:body.status||"in-stock",
 notes:String(body.notes||"").trim()
});

export const createInventoryItem=async(req,res)=>{
 try{
  const payload=normalizePayload(req.body);

  if(!payload.name)return res.status(400).json({success:false,message:"Item name is required"});
  if(!payload.category)return res.status(400).json({success:false,message:"Category is required"});
  if(!payload.unit)return res.status(400).json({success:false,message:"Unit is required"});

  const item=await InventoryItem.create(payload);
  return res.status(201).json({success:true,message:"Inventory item created successfully",inventory:item,item,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to create inventory item",error:error.message});
 }
};

export const getInventoryItems=async(req,res)=>{
 try{
  const {business,business_id,category,status,search,page=1,limit=100,sortBy="createdAt",sortOrder="desc"}=req.query;
  const query={};

  const businessValue=business||business_id;
  if(businessValue){
   if(!isValidObjectId(businessValue))return res.status(400).json({success:false,message:"Invalid business id"});
   query.$or=[{business:businessValue},{business_id:businessValue}];
  }

  if(category)query.category=category;
  if(status)query.status=status;
  if(search){
   const pattern=new RegExp(String(search).trim(),"i");
   query.$and=[
    ...(query.$and||[]),
    {$or:[{name:pattern},{category:pattern},{sku:pattern},{supplier:pattern}]}
   ];
  }

  const pageNum=Math.max(parseInt(page,10)||1,1);
  const limitNum=Math.max(parseInt(limit,10)||100,1);
  const skip=(pageNum-1)*limitNum;
  const sort={[sortBy]:sortOrder==="asc"?1:-1};

  const [items,total]=await Promise.all([
   InventoryItem.find(query).sort(sort).skip(skip).limit(limitNum),
   InventoryItem.countDocuments(query)
  ]);

  return res.status(200).json({
   success:true,
   count:items.length,
   total,
   page:pageNum,
   pages:Math.ceil(total/limitNum),
   inventory:items,
   items,
   data:items
  });
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory items",error:error.message});
 }
};

export const getInventoryItemById=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid inventory item id"});

  const item=await InventoryItem.findById(id);
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});

  return res.status(200).json({success:true,inventory:item,item,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to fetch inventory item",error:error.message});
 }
};

export const updateInventoryItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid inventory item id"});

  const payload=normalizePayload(req.body);
  if(!payload.name)return res.status(400).json({success:false,message:"Item name is required"});
  if(!payload.category)return res.status(400).json({success:false,message:"Category is required"});
  if(!payload.unit)return res.status(400).json({success:false,message:"Unit is required"});

  const item=await InventoryItem.findByIdAndUpdate(id,payload,{new:true,runValidators:true});
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});

  return res.status(200).json({success:true,message:"Inventory item updated successfully",inventory:item,item,data:item});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to update inventory item",error:error.message});
 }
};

export const deleteInventoryItem=async(req,res)=>{
 try{
  const {id}=req.params;
  if(!isValidObjectId(id))return res.status(400).json({success:false,message:"Invalid inventory item id"});

  const item=await InventoryItem.findByIdAndDelete(id);
  if(!item)return res.status(404).json({success:false,message:"Inventory item not found"});

  return res.status(200).json({success:true,message:"Inventory item deleted successfully"});
 }catch(error){
  return res.status(500).json({success:false,message:"Failed to delete inventory item",error:error.message});
 }
};
