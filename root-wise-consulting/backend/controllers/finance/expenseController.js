//backend/controllers/finance/expenseController.js
import Expense from "../../models/finance/expenseModel.js";

export const createExpense=async(req,res)=>{
 try{
  const payload={...req.body};
  if(req.user?._id) payload.createdBy=req.user._id;

  const expense=await Expense.create(payload);
  return res.status(201).json(expense);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getExpenses=async(req,res)=>{
 try{
  const query={};
  if(req.query.project) query.project=req.query.project;
  if(req.query.clientBusiness) query.clientBusiness=req.query.clientBusiness;
  if(req.query.status) query.status=req.query.status;

  const expenses=await Expense.find(query).sort({expenseDate:-1});
  return res.status(200).json(expenses);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const getExpenseById=async(req,res)=>{
 try{
  const expense=await Expense.findById(req.params.id);
  if(!expense) return res.status(404).json({message:"Expense not found"});
  return res.status(200).json(expense);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const updateExpense=async(req,res)=>{
 try{
  const expense=await Expense.findByIdAndUpdate(req.params.id,{$set:req.body},{returnDocument:"after",runValidators:true});
  if(!expense) return res.status(404).json({message:"Expense not found"});
  return res.status(200).json(expense);
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};

export const deleteExpense=async(req,res)=>{
 try{
  const expense=await Expense.findById(req.params.id);
  if(!expense) return res.status(404).json({message:"Expense not found"});
  await expense.deleteOne();
  return res.status(200).json({message:"Expense removed"});
 }catch(error){
  return res.status(500).json({message:error.message});
 }
};