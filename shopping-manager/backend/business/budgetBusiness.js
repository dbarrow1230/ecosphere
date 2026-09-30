// /backend/business/budgetBusiness.js
import {Budget,Purchase,PurchaseItem} from '../models/index.js';

const toNumber=value=>{
 const num=Number(value);
 return Number.isFinite(num)?num:0;
};

const CORE_BUDGET_TYPES=[
 {key:'cash',label:'Cash Budget'},
 {key:'food',label:'Food Budget'},
 {key:'entertainment',label:'Entertainment Budget'},
 {key:'home',label:'Home Budget'},
 {key:'electronics',label:'Electronics Budget'}
];

const getBudgetTypeKey=value=>{
 const normalized=String(value||'').trim().toLowerCase();
 const found=CORE_BUDGET_TYPES.find(type=>type.key===normalized||type.label.toLowerCase()===normalized);
 return found?.key||normalized;
};

const makeBudgetTypeKey=value=>{
 const key=getBudgetTypeKey(value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 return key||`budget-${Date.now()}`;
};

const calculateAllocationTracking=allocation=>{
 const amount=toNumber(allocation.amount);
 const spent=toNumber(allocation.spent);
 allocation.amount=amount;
 allocation.spent=spent;
 allocation.remainingAmount=amount-spent;
 allocation.percentUsed=amount>0?Math.round((spent/amount)*10000)/100:0;
 allocation.isOverBudget=spent>amount;
 return allocation;
};

const normalizeAllocations=(allocations=[])=>{
 const usedTargets=new Set();
 return allocations
  .filter(item=>item?.budgetType&&(item?.category||String(item?.targetName||'').trim()))
  .map(item=>{
   const budgetType=makeBudgetTypeKey(item.budgetType);
   const categoryId=item.category?String(item.category?._id||item.category):'';
   const targetName=String(item.targetName||'').trim();
   const targetKey=`${budgetType}:${categoryId||targetName.toLowerCase()}`;
   if(usedTargets.has(targetKey)){
    throw new Error('Each category can only be allocated once per budget type');
   }
   usedTargets.add(targetKey);
   return calculateAllocationTracking({
    budgetType,
    category:item.category?._id||item.category||null,
    targetName,
    amount:item.amount,
    spent:item.spent,
    isPriority:!!item.isPriority,
    notes:item.notes||''
   });
  });
};

const calculateBudgetTypeTracking=(budgetTypes=[],allocations=[])=>{
 return budgetTypes.map(item=>{
  const key=makeBudgetTypeKey(item.key||item.label||item.type);
  const label=item.label||CORE_BUDGET_TYPES.find(type=>type.key===key)?.label||key;
  const amount=toNumber(item.amount);
  const spent=allocations
   .filter(allocation=>getBudgetTypeKey(allocation.budgetType)===key)
   .reduce((sum,allocation)=>sum+toNumber(allocation.spent),0);
  const remainingAmount=amount-spent;
  return{
   key,
   label,
   amount,
   spent,
   remainingAmount,
   percentUsed:amount>0?Math.round((spent/amount)*10000)/100:0,
   isOverBudget:spent>amount
  };
 });
};

const normalizeBudgetTypes=(budgetTypes=[],legacy={})=>{
 const incoming=new Map();
 if(Array.isArray(budgetTypes)){
  for(const item of budgetTypes){
   const key=makeBudgetTypeKey(item.key||item.label||item.type);
   if(key)incoming.set(key,item);
  }
 }
 const legacyKey=getBudgetTypeKey(legacy.budgetType);
 const defaults=CORE_BUDGET_TYPES.map(type=>{
  const item=incoming.get(type.key);
  incoming.delete(type.key);
  const legacyAmount=legacyKey===type.key?legacy.totalAmount:0;
  return{
   key:type.key,
   label:type.label,
   amount:toNumber(item?.amount??legacyAmount),
   spent:toNumber(item?.spent),
   remainingAmount:toNumber(item?.remainingAmount),
   percentUsed:toNumber(item?.percentUsed),
   isOverBudget:!!item?.isOverBudget
  };
 });
 const custom=[...incoming.entries()].map(([key,item])=>({
  key,
  label:item.label||item.name||key,
  amount:toNumber(item.amount),
  spent:toNumber(item.spent),
  remainingAmount:toNumber(item.remainingAmount),
  percentUsed:toNumber(item.percentUsed),
  isOverBudget:!!item.isOverBudget
 }));
 return [...defaults,...custom].filter(item=>item.label||item.amount>0);
};

const normalizeBudgetInput=(data={},includeMissing=false)=>{
 const normalized={...data};
 if(Array.isArray(data.budgetTypes)||includeMissing){
  const allocations=Array.isArray(data.allocations)?normalizeAllocations(data.allocations):[];
  normalized.budgetTypes=calculateBudgetTypeTracking(normalizeBudgetTypes(data.budgetTypes,{budgetType:data.budgetType,totalAmount:data.totalAmount}),allocations);
  normalized.allocations=allocations;
  normalized.totalAmount=normalized.budgetTypes.reduce((sum,item)=>sum+toNumber(item.amount),0);
  normalized.totalSpent=allocations.reduce((sum,item)=>sum+toNumber(item.spent),0);
  if(includeMissing||data.alertAtPercent!==undefined)normalized.alertAtPercent=toNumber(data.alertAtPercent);
  normalized.budgetType='';
  return normalized;
 }
 if(includeMissing||data.totalAmount!==undefined)normalized.totalAmount=toNumber(data.totalAmount);
 if(includeMissing||data.totalSpent!==undefined)normalized.totalSpent=toNumber(data.totalSpent);
 if(includeMissing||data.alertAtPercent!==undefined)normalized.alertAtPercent=toNumber(data.alertAtPercent);
 if(Array.isArray(data.allocations))normalized.allocations=normalizeAllocations(data.allocations);
 return normalized;
};

const validateBudgetAllocations=b=>{
 const totalsByType=new Map((b.budgetTypes||[]).map(item=>[getBudgetTypeKey(item.key),toNumber(item.amount)]));
 if(totalsByType.size){
  const allocationTotals=(b.allocations||[]).reduce((acc,item)=>{
   const key=getBudgetTypeKey(item.budgetType);
   acc[key]=(acc[key]||0)+toNumber(item.amount);
   return acc;
  },{});
  for(const [key,total] of Object.entries(allocationTotals)){
   if(total>toNumber(totalsByType.get(key))){
    throw new Error(`${CORE_BUDGET_TYPES.find(type=>type.key===key)?.label||key} allocations cannot exceed that budget type amount`);
   }
  }
 }else{
  const totalAmount=toNumber(b.totalAmount);
  const allocationTotal=(b.allocations||[]).reduce((sum,item)=>sum+toNumber(item.amount),0);
  if(allocationTotal>totalAmount){
   throw new Error('Total allocation amount cannot exceed total budget amount');
  }
 }
 return true;
};

export const recalculateBudgetSpentLogic=async(budgetId)=>{
 const budget=await Budget.findById(budgetId);
 if(!budget) throw new Error('Budget not found');

 validateBudgetAllocations(budget);

 const purchases=await Purchase.find({
  user:budget.user,
  purchaseDate:{
   $gte:new Date(budget.startDate),
   $lte:new Date(budget.endDate)
  }
 }).select('_id total refundTotal purchaseDate');

 const purchaseIds=purchases.map(purchase=>purchase._id);

 const purchaseItems=await PurchaseItem.find({
  purchase:{$in:purchaseIds}
 }).populate({
  path:'product',
  select:'category'
 });

 for(const allocation of budget.allocations||[]){
  let allocationSpent=0;

  for(const item of purchaseItems){
   const productCategory=item?.product?.category;
   if(allocation.category&&productCategory&&String(productCategory)===String(allocation.category)){
    allocationSpent+=toNumber(item.subtotal)-toNumber(item.refundAmount);
   }
  }

  allocation.spent=allocationSpent;
  calculateAllocationTracking(allocation);
 }

 budget.budgetTypes=calculateBudgetTypeTracking(
  normalizeBudgetTypes(budget.budgetTypes,{budgetType:budget.budgetType,totalAmount:budget.totalAmount}),
  budget.allocations||[]
 );

 const totalSpent=purchases.reduce((sum,purchase)=>{
  return sum+toNumber(purchase.total)-toNumber(purchase.refundTotal);
 },0);

 budget.totalAmount=(budget.budgetTypes||[]).reduce((sum,item)=>sum+toNumber(item.amount),0);
 budget.totalSpent=totalSpent;
 budget.isOverBudget=(budget.allocations||[]).some(item=>item.isOverBudget)||(budget.budgetTypes||[]).some(item=>item.isOverBudget)||totalSpent>toNumber(budget.totalAmount);

 await budget.save();
 return budget;
};

export const applyPurchaseToBudgetLogic=async(purchaseId)=>{
 const purchase=await Purchase.findById(purchaseId);
 if(!purchase) throw new Error('Purchase not found');

 const budgets=await Budget.find({
  user:purchase.user,
  isActive:true,
  startDate:{$lte:new Date(purchase.purchaseDate)},
  endDate:{$gte:new Date(purchase.purchaseDate)}
 });

 for(const budget of budgets){
  await recalculateBudgetSpentLogic(budget._id);
 }

 return true;
};

export const reverseRefundFromBudgetLogic=async(purchaseId)=>{
 const purchase=await Purchase.findById(purchaseId);
 if(!purchase) throw new Error('Purchase not found');

 const budgets=await Budget.find({
  user:purchase.user,
  isActive:true,
  startDate:{$lte:new Date(purchase.purchaseDate)},
  endDate:{$gte:new Date(purchase.purchaseDate)}
 });

 for(const budget of budgets){
  await recalculateBudgetSpentLogic(budget._id);
 }

 return true;
};

export const getBudgetInsightsLogic=async({userId,yearStart,yearEnd,monthStart,monthEnd}={})=>{
 const yearlyBudgets=await Budget.find({
  user:userId,
  isActive:true,
  startDate:{$gte:new Date(yearStart)},
  endDate:{$lte:new Date(yearEnd)}
 }).populate('allocations.category');

 const monthlyBudgets=await Budget.find({
  user:userId,
  isActive:true,
  startDate:{$gte:new Date(monthStart)},
  endDate:{$lte:new Date(monthEnd)}
 }).populate('allocations.category');

 const mapAllocations=budgets=>{
  const rows=[];

  for(const budget of budgets){
   for(const allocation of budget.allocations||[]){
    const amount=toNumber(allocation.amount);
    const spent=toNumber(allocation.spent);
    rows.push({
     key:`${budget._id}-${allocation.category?._id||allocation.category}`,
     category:allocation.category?.name||'Uncategorized',
     budget:amount,
     spent,
     percent:amount>0?(spent/amount)*100:0,
     isOverBudget:!!allocation.isOverBudget
    });
   }
  }

  return rows;
 };

 const yearlyByCategory=mapAllocations(yearlyBudgets);
 const monthlyByCategory=mapAllocations(monthlyBudgets);

 const overBudget=[
  ...yearlyByCategory.filter(item=>item.isOverBudget).map(item=>({...item,period:'Yearly'})),
  ...monthlyByCategory.filter(item=>item.isOverBudget).map(item=>({...item,period:'Monthly'}))
 ];

 return{
  yearlyByCategory,
  monthlyByCategory,
  overBudget
 };
};

export const createBudgetLogic=async(data={})=>{
 const budget=await Budget.create(normalizeBudgetInput(data,true));
 await recalculateBudgetSpentLogic(budget._id);
 return await Budget.findById(budget._id).populate('user allocations.category');
};

export const updateBudgetLogic=async(budgetId,data={})=>{
 const budget=await Budget.findById(budgetId);
 if(!budget) throw new Error('Budget not found');

 Object.assign(budget,normalizeBudgetInput(data));
 validateBudgetAllocations(budget);

 await budget.save();
 await recalculateBudgetSpentLogic(budget._id);

 return await Budget.findById(budget._id).populate('user allocations.category');
};

export default{
 recalculateBudgetSpentLogic,
 applyPurchaseToBudgetLogic,
 reverseRefundFromBudgetLogic,
 getBudgetInsightsLogic,
 createBudgetLogic,
 updateBudgetLogic
};
