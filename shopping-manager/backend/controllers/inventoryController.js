// /backend/controllers/inventoryController.js
import Inventory from '../models/inventoryModel.js';

export const createInventory=async(req,res)=>{
try{
const{user,product,unit,store,quantity,minQuantity,maxQuantity,reorderLevel,purchaseDate,expiryDate,location,notes,isLowStock}=req.body;
if(!user||!product||quantity===undefined)return res.status(400).json({success:false,message:'User, product, and quantity are required'});
const inventory=await Inventory.create({user,product,unit,store,quantity,minQuantity,maxQuantity,reorderLevel,purchaseDate,expiryDate,location,notes,isLowStock});
res.status(201).json({success:true,message:'Inventory created successfully',inventory});
}catch(error){
res.status(500).json({success:false,message:'Error creating inventory',error:error.message});
}
};

export const getInventories=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.product)query.product=req.query.product;
if(req.query.store)query.store=req.query.store;
if(req.query.isLowStock!==undefined)query.isLowStock=req.query.isLowStock==='true';
const inventories=await Inventory.find(query)
.populate('user')
.populate('product')
.populate('unit')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:inventories.length,inventories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching inventories',error:error.message});
}
};

export const getLowStockInventories=async(req,res)=>{
try{
const query={isLowStock:true};
if(req.query.user)query.user=req.query.user;
if(req.query.store)query.store=req.query.store;
const inventories=await Inventory.find(query)
.populate('user')
.populate('product')
.populate('unit')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:inventories.length,inventories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching low stock inventories',error:error.message});
}
};

export const getInventoryById=async(req,res)=>{
try{
const inventory=await Inventory.findById(req.params.id)
.populate('user')
.populate('product')
.populate('unit')
.populate('store');
if(!inventory)return res.status(404).json({success:false,message:'Inventory not found'});
res.status(200).json({success:true,inventory});
}catch(error){
res.status(500).json({success:false,message:'Error fetching inventory',error:error.message});
}
};

export const getInventoriesByUser=async(req,res)=>{
try{
const inventories=await Inventory.find({user:req.params.userId})
.populate('user')
.populate('product')
.populate('unit')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:inventories.length,inventories});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user inventories',error:error.message});
}
};

export const updateInventory=async(req,res)=>{
try{
const{user,product,unit,store,quantity,minQuantity,maxQuantity,reorderLevel,purchaseDate,expiryDate,location,notes,isLowStock}=req.body;
const inventory=await Inventory.findById(req.params.id);
if(!inventory)return res.status(404).json({success:false,message:'Inventory not found'});
inventory.user=user??inventory.user;
inventory.product=product??inventory.product;
inventory.unit=unit!==undefined?unit:inventory.unit;
inventory.store=store!==undefined?store:inventory.store;
inventory.quantity=quantity??inventory.quantity;
inventory.minQuantity=minQuantity??inventory.minQuantity;
inventory.maxQuantity=maxQuantity??inventory.maxQuantity;
inventory.reorderLevel=reorderLevel??inventory.reorderLevel;
inventory.purchaseDate=purchaseDate!==undefined?purchaseDate:inventory.purchaseDate;
inventory.expiryDate=expiryDate!==undefined?expiryDate:inventory.expiryDate;
inventory.location=location??inventory.location;
inventory.notes=notes??inventory.notes;
inventory.isLowStock=isLowStock??inventory.isLowStock;
await inventory.save();
const updatedInventory=await Inventory.findById(inventory._id)
.populate('user')
.populate('product')
.populate('unit')
.populate('store');
res.status(200).json({success:true,message:'Inventory updated successfully',inventory:updatedInventory});
}catch(error){
res.status(500).json({success:false,message:'Error updating inventory',error:error.message});
}
};

export const deleteInventory=async(req,res)=>{
try{
const inventory=await Inventory.findById(req.params.id);
if(!inventory)return res.status(404).json({success:false,message:'Inventory not found'});
await Inventory.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Inventory deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting inventory',error:error.message});
}
};