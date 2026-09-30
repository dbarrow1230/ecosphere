// /backend/controllers/shoppingListItemController.js
import ShoppingListItem from '../models/shoppingListItemModel.js';

export const createShoppingListItem=async(req,res)=>{
try{
const{shoppingList,user,product,store,unit,quantity,estimatedPrice,priority,notes,isPurchased,purchasedAt}=req.body;
if(!shoppingList||!user||!product||quantity===undefined)return res.status(400).json({success:false,message:'Shopping list, user, product, and quantity are required'});
const shoppingListItem=await ShoppingListItem.create({shoppingList,user,product,store,unit,quantity,estimatedPrice,priority,notes,isPurchased,purchasedAt});
res.status(201).json({success:true,message:'Shopping list item created successfully',shoppingListItem});
}catch(error){
res.status(500).json({success:false,message:'Error creating shopping list item',error:error.message});
}
};

export const getShoppingListItems=async(req,res)=>{
try{
const query={};
if(req.query.shoppingList)query.shoppingList=req.query.shoppingList;
if(req.query.user)query.user=req.query.user;
if(req.query.product)query.product=req.query.product;
if(req.query.store)query.store=req.query.store;
if(req.query.priority)query.priority=req.query.priority;
if(req.query.isPurchased!==undefined)query.isPurchased=req.query.isPurchased==='true';
const shoppingListItems=await ShoppingListItem.find(query)
.populate('shoppingList')
.populate('user')
.populate('product')
.populate('store')
.populate('unit')
.populate('priority')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingListItems.length,shoppingListItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching shopping list items',error:error.message});
}
};

export const getPurchasedShoppingListItems=async(req,res)=>{
try{
const query={isPurchased:true};
if(req.query.shoppingList)query.shoppingList=req.query.shoppingList;
if(req.query.user)query.user=req.query.user;
const shoppingListItems=await ShoppingListItem.find(query)
.populate('shoppingList')
.populate('user')
.populate('product')
.populate('store')
.populate('unit')
.populate('priority')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingListItems.length,shoppingListItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching purchased shopping list items',error:error.message});
}
};

export const getShoppingListItemById=async(req,res)=>{
try{
const shoppingListItem=await ShoppingListItem.findById(req.params.id)
.populate('shoppingList')
.populate('user')
.populate('product')
.populate('store')
.populate('unit')
.populate('priority');
if(!shoppingListItem)return res.status(404).json({success:false,message:'Shopping list item not found'});
res.status(200).json({success:true,shoppingListItem});
}catch(error){
res.status(500).json({success:false,message:'Error fetching shopping list item',error:error.message});
}
};

export const getShoppingListItemsByList=async(req,res)=>{
try{
const shoppingListItems=await ShoppingListItem.find({shoppingList:req.params.shoppingListId})
.populate('shoppingList')
.populate('user')
.populate('product')
.populate('store')
.populate('unit')
.populate('priority')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingListItems.length,shoppingListItems});
}catch(error){
res.status(500).json({success:false,message:'Error fetching shopping list items for list',error:error.message});
}
};

export const updateShoppingListItem=async(req,res)=>{
try{
const{shoppingList,user,product,store,unit,quantity,estimatedPrice,priority,notes,isPurchased,purchasedAt}=req.body;
const shoppingListItem=await ShoppingListItem.findById(req.params.id);
if(!shoppingListItem)return res.status(404).json({success:false,message:'Shopping list item not found'});
shoppingListItem.shoppingList=shoppingList??shoppingListItem.shoppingList;
shoppingListItem.user=user??shoppingListItem.user;
shoppingListItem.product=product??shoppingListItem.product;
shoppingListItem.store=store!==undefined?store:shoppingListItem.store;
shoppingListItem.unit=unit!==undefined?unit:shoppingListItem.unit;
shoppingListItem.quantity=quantity??shoppingListItem.quantity;
shoppingListItem.estimatedPrice=estimatedPrice??shoppingListItem.estimatedPrice;
shoppingListItem.priority=priority!==undefined?priority:shoppingListItem.priority;
shoppingListItem.notes=notes??shoppingListItem.notes;
shoppingListItem.isPurchased=isPurchased!==undefined?isPurchased:shoppingListItem.isPurchased;
shoppingListItem.purchasedAt=purchasedAt!==undefined?purchasedAt:shoppingListItem.purchasedAt;
await shoppingListItem.save();
const updatedShoppingListItem=await ShoppingListItem.findById(shoppingListItem._id)
.populate('shoppingList')
.populate('user')
.populate('product')
.populate('store')
.populate('unit')
.populate('priority');
res.status(200).json({success:true,message:'Shopping list item updated successfully',shoppingListItem:updatedShoppingListItem});
}catch(error){
res.status(500).json({success:false,message:'Error updating shopping list item',error:error.message});
}
};

export const deleteShoppingListItem=async(req,res)=>{
try{
const shoppingListItem=await ShoppingListItem.findById(req.params.id);
if(!shoppingListItem)return res.status(404).json({success:false,message:'Shopping list item not found'});
await ShoppingListItem.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Shopping list item deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting shopping list item',error:error.message});
}
};