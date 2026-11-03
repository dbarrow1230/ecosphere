// /backend/controllers/budgetController.js
import Budget from '../models/budgetModel.js';
import {createBudgetLogic,updateBudgetLogic} from '../business/budgetBusiness.js';

const getErrorStatus=error=>/required|cannot exceed|only be allocated once/i.test(error.message)?400:500;

export const createBudget=async(req,res)=>{
try{
const{user,name,budgetTypes,totalAmount,startDate,endDate}=req.body;
if(!user||!name||(!Array.isArray(budgetTypes)&&totalAmount===undefined)||!startDate||!endDate)return res.status(400).json({success:false,message:'User, name, budgetTypes, startDate, and endDate are required'});
const budget=await createBudgetLogic(req.body);
res.status(201).json({success:true,message:'Budget created successfully',budget});
}catch(error){
res.status(getErrorStatus(error)).json({success:false,message:error.message||'Error creating budget',error:error.message});
}
};

export const getBudgets=async(req,res)=>{
try{
const query={};
if(req.query.user)query.user=req.query.user;
if(req.query.isActive!==undefined)query.isActive=req.query.isActive==='true';
const budgets=await Budget.find(query)
.populate('user')
.populate('allocations.category')
.sort({createdAt:-1});
res.status(200).json({success:true,count:budgets.length,budgets});
}catch(error){
res.status(500).json({success:false,message:'Error fetching budgets',error:error.message});
}
};

export const getActiveBudgets=async(req,res)=>{
try{
const query={isActive:true};
if(req.query.user)query.user=req.query.user;
const budgets=await Budget.find(query)
.populate('user')
.populate('allocations.category')
.sort({createdAt:-1});
res.status(200).json({success:true,count:budgets.length,budgets});
}catch(error){
res.status(500).json({success:false,message:'Error fetching active budgets',error:error.message});
}
};

export const getBudgetById=async(req,res)=>{
try{
const budget=await Budget.findById(req.params.id)
.populate('user')
.populate('allocations.category');
if(!budget)return res.status(404).json({success:false,message:'Budget not found'});
res.status(200).json({success:true,budget});
}catch(error){
res.status(500).json({success:false,message:'Error fetching budget',error:error.message});
}
};

export const getBudgetsByUser=async(req,res)=>{
try{
const budgets=await Budget.find({user:req.params.userId})
.populate('user')
.populate('allocations.category')
.sort({createdAt:-1});
res.status(200).json({success:true,count:budgets.length,budgets});
}catch(error){
res.status(500).json({success:false,message:'Error fetching user budgets',error:error.message});
}
};

export const updateBudget=async(req,res)=>{
try{
const budget=await Budget.findById(req.params.id);
if(!budget)return res.status(404).json({success:false,message:'Budget not found'});
const updatedBudget=await updateBudgetLogic(req.params.id,req.body);
res.status(200).json({success:true,message:'Budget updated successfully',budget:updatedBudget});
}catch(error){
res.status(getErrorStatus(error)).json({success:false,message:error.message||'Error updating budget',error:error.message});
}
};

export const deleteBudget=async(req,res)=>{
try{
const budget=await Budget.findById(req.params.id);
if(!budget)return res.status(404).json({success:false,message:'Budget not found'});
await Budget.findByIdAndDelete(req.params.id);
res.status(200).json({success:true,message:'Budget deleted successfully'});
}catch(error){
res.status(500).json({success:false,message:'Error deleting budget',error:error.message});
}
};
