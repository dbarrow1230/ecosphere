// /backend/controllers/shoppingListController.js
import ShoppingList from '../models/shoppingListModel.js';

export const createShoppingList=async(req,res)=>{
try{
const{user,name,description,status,type,store,budget,targetDate,isFavorite}=req.body;
if(!user||!name)return res.status(400).json({success:false,message:'User and name are required'});
const shoppingList=await ShoppingList.create({user,name,description,status,type,store,budget,targetDate,isFavorite});
res.status(201).json({success:true,message:'Shopping list created successfully',shoppingList});
}catch(error){
res.status(500).json({success:false,message:'Error creating shopping list',error:error.message});
}
};

export const getShoppingLists=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.status)query.status=req.query.status;
if(req.query.store)query.store=req.query.store;
if(req.query.type)query.type=req.query.type;
if(req.query.isFavorite!==undefined)query.isFavorite=req.query.isFavorite==='true';
const shoppingLists=await ShoppingList.find(query)
.populate('user')
.populate('status')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingLists.length,shoppingLists});
}catch(error){
res.status(500).json({success:false,message:'Error fetching shopping lists',error:error.message});
}
};

export const getFavoriteShoppingLists=async(req,res)=>{
try{
const query={isFavorite:true};
if(req.query.user)query.user=req.query.user;
const shoppingLists=await ShoppingList.find(query)
.populate('user')
.populate('status')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingLists.length,shoppingLists});
}catch(error){
res.status(500).json({success:false,message:'Error fetching favorite shopping lists',error:error.message});
}
};

export const getShoppingListById=async(req,res)=>{
try{
const shoppingList=await ShoppingList.findById(req.params.id)
.populate('user')
.populate('status')
.populate('store');
if(!shoppingList)return res.status(404).json({success:false,message:'Shopping list not found'});
res.status(200).json({success:true,shoppingList});
}catch(error){
res.status(500).json({success:false,message:'Error fetching shopping list',error:error.message});
}
};

export const getShoppingListsByUser=async(req,res)=>{
try{
const shoppingLists=await ShoppingList.find({user:req.params.userId})
.populate('user')
.populate('status')
.populate('store')
.sort({createdAt:-1});
res.status(200).json({success:true,count:shoppingLists.length,shoppingLists});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user shopping lists',error:error.message});
}
};

export const updateShoppingList=async(req,res)=>{
try{
const{user,name,description,status,type,store,budget,targetDate,isFavorite}=req.body;
const shoppingList=await ShoppingList.findById(req.params.id);
if(!shoppingList)return res.status(404).json({success:false,message:'Shopping list not found'});
shoppingList.user=user??shoppingList.user;
shoppingList.name=name??shoppingList.name;
shoppingList.description=description??shoppingList.description;
shoppingList.status=status!==undefined?status:shoppingList.status;
shoppingList.type=type??shoppingList.type;
shoppingList.store=store!==undefined?store:shoppingList.store;
shoppingList.budget=budget??shoppingList.budget;
shoppingList.targetDate=targetDate!==undefined?targetDate:shoppingList.targetDate;
shoppingList.isFavorite=isFavorite!==undefined?isFavorite:shoppingList.isFavorite;
await shoppingList.save();
const updatedShoppingList=await ShoppingList.findById(shoppingList._id)
.populate('user')
.populate('status')
.populate('store');
res.status(200).json({success:true,message:'Shopping list updated successfully',shoppingList:updatedShoppingList});
}catch(error){
res.status(500).json({success:false,message:'Error updating shopping list',error:error.message});
}
};

export const deleteShoppingList=async(req,res)=>{
try{
const shoppingList=await ShoppingList.findById(req.params.id);
if(!shoppingList)return res.status(404).json({success:false,message:'Shopping list not found'});
await ShoppingList.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Shopping list deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting shopping list',error:error.message});
}
};