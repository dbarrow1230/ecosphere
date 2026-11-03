// /backend/controllers/returnItemController.js
import ReturnItem from '../models/returnItemModel.js';

export const createReturnItem=async(req,res)=>{
try{
const{return:returnId,orderItem,purchaseItem,product,unit,quantity,unitPrice,refundAmount,reason,condition,resolution,status,notes}=req.body;
if(!returnId||!product||quantity===undefined)return res.status(400).json({success:false,message:'Return, product, and quantity are required'});
const returnItem=await ReturnItem.create({return:returnId,orderItem,purchaseItem,product,unit,quantity,unitPrice,refundAmount,reason,condition,resolution,status,notes});
res.status(201).json({success:true,message:'Return item created successfully',returnItem});
}catch(error){
res.status(500).json({success:false,message:'Error creating return item',error:error.message});
}
};

export const getReturnItems=async(req,res)=>{
try{
const query={};
if(req.query.return)query.return=req.query.return;
if(req.query.orderItem)query.orderItem=req.query.orderItem;
if(req.query.purchaseItem)query.purchaseItem=req.query.purchaseItem;
if(req.query.product)query.product=req.query.product;
if(req.query.status)query.status=req.query.status;
const returnItems=await ReturnItem.find(query)
.populate('return')
.populate('orderItem')
.populate('purchaseItem')
.populate('product')
.populate('unit')
.populate('reason')
.populate('condition')
.populate('resolution')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:returnItems.length,returnItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching return items',error:error.message});
}
};

export const getReturnItemById=async(req,res)=>{
try{
const returnItem=await ReturnItem.findById(req.params.id)
.populate('return')
.populate('orderItem')
.populate('purchaseItem')
.populate('product')
.populate('unit')
.populate('reason')
.populate('condition')
.populate('resolution')
.populate('status');
if(!returnItem)return res.status(404).json({success:false,message:'Return item not found'});
res.status(200).json({success:true,returnItem});
}catch(error){
res.status(500).json({success:false,message:'Error fetching return item',error:error.message});
}
};

export const getReturnItemsByReturn=async(req,res)=>{
try{
const returnItems=await ReturnItem.find({return:req.params.returnId})
.populate('return')
.populate('orderItem')
.populate('purchaseItem')
.populate('product')
.populate('unit')
.populate('reason')
.populate('condition')
.populate('resolution')
.populate('status')
.sort({createdAt:-1});
res.status(200).json({success:true,count:returnItems.length,returnItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching return items for return',error:error.message});
}
};

export const updateReturnItem=async(req,res)=>{
try{
const{return:returnId,orderItem,purchaseItem,product,unit,quantity,unitPrice,refundAmount,reason,condition,resolution,status,notes}=req.body;
const returnItem=await ReturnItem.findById(req.params.id);
if(!returnItem)return res.status(404).json({success:false,message:'Return item not found'});
returnItem.return=returnId??returnItem.return;
returnItem.orderItem=orderItem!==undefined?orderItem:returnItem.orderItem;
returnItem.purchaseItem=purchaseItem!==undefined?purchaseItem:returnItem.purchaseItem;
returnItem.product=product??returnItem.product;
returnItem.unit=unit!==undefined?unit:returnItem.unit;
returnItem.quantity=quantity??returnItem.quantity;
returnItem.unitPrice=unitPrice??returnItem.unitPrice;
returnItem.refundAmount=refundAmount??returnItem.refundAmount;
returnItem.reason=reason!==undefined?reason:returnItem.reason;
returnItem.condition=condition!==undefined?condition:returnItem.condition;
returnItem.resolution=resolution!==undefined?resolution:returnItem.resolution;
returnItem.status=status!==undefined?status:returnItem.status;
returnItem.notes=notes??returnItem.notes;
await returnItem.save();
const updatedReturnItem=await ReturnItem.findById(returnItem._id)
.populate('return')
.populate('orderItem')
.populate('purchaseItem')
.populate('product')
.populate('unit')
.populate('reason')
.populate('condition')
.populate('resolution')
.populate('status');
res.status(200).json({success:true,message:'Return item updated successfully',returnItem:updatedReturnItem});
}catch(error){
res.status(500).json({success:false,message:'Error updating return item',error:error.message});
}
};

export const deleteReturnItem=async(req,res)=>{
try{
const returnItem=await ReturnItem.findById(req.params.id);
if(!returnItem)return res.status(404).json({success:false,message:'Return item not found'});
await ReturnItem.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Return item deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting return item',error:error.message});
}
};