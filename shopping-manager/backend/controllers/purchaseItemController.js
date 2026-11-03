// /backend/controllers/purchaseItemController.js
import PurchaseItem from '../models/purchaseItemModel.js';

export const createPurchaseItem=async(req,res)=>{
try{
const{purchase,product,shoppingListItem,unit,quantity,unitPrice,discountAmount,taxAmount,subtotal,notes}=req.body;
if(!purchase||!product||quantity===undefined||unitPrice===undefined||subtotal===undefined)return res.status(400).json({success:false,message:'Purchase, product, quantity, unitPrice, and subtotal are required'});
const purchaseItem=await PurchaseItem.create({purchase,product,shoppingListItem,unit,quantity,unitPrice,discountAmount,taxAmount,subtotal,notes});
res.status(201).json({success:true,message:'Purchase item created successfully',purchaseItem});
}catch(error){
res.status(500).json({success:false,message:'Error creating purchase item',error:error.message});
}
};

export const getPurchaseItems=async(req,res)=>{
try{
const query={};
if(req.query.purchase)query.purchase=req.query.purchase;
if(req.query.product)query.product=req.query.product;
const purchaseItems=await PurchaseItem.find(query)
.populate('purchase')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.sort({createdAt:-1});
res.status(200).json({success:true,count:purchaseItems.length,purchaseItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchase items',error:error.message});
}
};

export const getPurchaseItemById=async(req,res)=>{
try{
const purchaseItem=await PurchaseItem.findById(req.params.id)
.populate('purchase')
.populate('product')
.populate('shoppingListItem')
.populate('unit');
if(!purchaseItem)return res.status(404).json({success:false,message:'Purchase item not found'});
res.status(200).json({success:true,purchaseItem});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchase item',error:error.message});
}
};

export const getPurchaseItemsByPurchase=async(req,res)=>{
try{
const purchaseItems=await PurchaseItem.find({purchase:req.params.purchaseId})
.populate('purchase')
.populate('product')
.populate('shoppingListItem')
.populate('unit')
.sort({createdAt:-1});
res.status(200).json({success:true,count:purchaseItems.length,purchaseItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchase items for purchase',error:error.message});
}
};

export const updatePurchaseItem=async(req,res)=>{
try{
const{purchase,product,shoppingListItem,unit,quantity,unitPrice,discountAmount,taxAmount,subtotal,notes}=req.body;
const purchaseItem=await PurchaseItem.findById(req.params.id);
if(!purchaseItem)return res.status(404).json({success:false,message:'Purchase item not found'});
purchaseItem.purchase=purchase??purchaseItem.purchase;
purchaseItem.product=product??purchaseItem.product;
purchaseItem.shoppingListItem=shoppingListItem!==undefined?shoppingListItem:purchaseItem.shoppingListItem;
purchaseItem.unit=unit!==undefined?unit:purchaseItem.unit;
purchaseItem.quantity=quantity??purchaseItem.quantity;
purchaseItem.unitPrice=unitPrice??purchaseItem.unitPrice;
purchaseItem.discountAmount=discountAmount??purchaseItem.discountAmount;
purchaseItem.taxAmount=taxAmount??purchaseItem.taxAmount;
purchaseItem.subtotal=subtotal??purchaseItem.subtotal;
purchaseItem.notes=notes??purchaseItem.notes;
await purchaseItem.save();
const updatedPurchaseItem=await PurchaseItem.findById(purchaseItem._id)
.populate('purchase')
.populate('product')
.populate('shoppingListItem')
.populate('unit');
res.status(200).json({success:true,message:'Purchase item updated successfully',purchaseItem:updatedPurchaseItem});
}catch(error){
res.status(500).json({success:false,message:'Error updating purchase item',error:error.message});
}
};

export const deletePurchaseItem=async(req,res)=>{
try{
const purchaseItem=await PurchaseItem.findById(req.params.id);
if(!purchaseItem)return res.status(404).json({success:false,message:'Purchase item not found'});
await PurchaseItem.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Purchase item deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting purchase item',error:error.message});
}
};