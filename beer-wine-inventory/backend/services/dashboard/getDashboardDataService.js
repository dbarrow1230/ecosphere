import mongoose from "mongoose";
import BeverageItem from "../../models/beverages/beverageItemModel.js";
import InventoryBalance from "../../models/inventory/inventoryBalanceModel.js";
import InventoryLot from "../../models/inventory/inventoryLotModel.js";
import InventoryTransaction from "../../models/inventory/inventoryTransactionModel.js";

export function summarizeInventory(itemsRaw,balances,lots,transactions,reportDate=new Date()){
 const balanceMap=new Map();
 for(const balance of balances){
  const key=String(balance.beverageItemRef);
  const sum=balanceMap.get(key)||{qty:0,value:0};
  sum.qty+=balance.qtyOnHand||0;
  sum.value+=(balance.qtyOnHand||0)*(balance.avgCost||0);
  balanceMap.set(key,sum);
 }
 const items=itemsRaw.map(item=>{
  const balance=balanceMap.get(String(item._id))||{qty:0,value:0};
  return {...item,id:item._id,type:item.beverageType,stock:balance.qty,quantity:balance.qty,
   minStock:item.minLevel,maxStock:item.maxLevel,unitCost:balance.qty?balance.value/balance.qty:0,
   price:item.sellingPrice,category:item.categoryRef?.name||"Uncategorized",
   unit:item.uomRef?.symbol||item.uomRef?.name||"",supplier:item.preferredVendorRef?.legalName||"",
   financials:{stockValue:balance.value}};
 });
 const byId=new Map(items.map(item=>[String(item._id),item]));
 const lowStockItems=items.filter(item=>item.isActive&&item.stock<=Math.max(item.reorderPoint||0,item.minLevel||0));
 const cutoff=new Date(reportDate);cutoff.setDate(cutoff.getDate()+30);
 const expiringItems=lots.filter(lot=>lot.qtyOnHand>0&&lot.expiryDate&&new Date(lot.expiryDate)<=cutoff).map(lot=>({
  _id:lot._id,name:byId.get(String(lot.beverageItemRef))?.name||"Unknown beverage",
  quantity:lot.qtyOnHand,expiryDate:new Date(lot.expiryDate).toISOString().slice(0,10),location:lot.locationRef?.name||"Inventory"
 }));
 const receiptTransactions=transactions.filter(tx=>tx.transactionType==="receipt");
 const categoryCosts=receiptTransactions.map(tx=>{
  const item=byId.get(String(tx.beverageItemRef));
  return {date:tx.createdAt,type:item?.beverageType?.toLowerCase(),category:item?.category||"Uncategorized",cost:tx.totalCost||0};
 });
 const recentItems=receiptTransactions.slice(0,10).map(tx=>({_id:tx._id,name:byId.get(String(tx.beverageItemRef))?.name||"Unknown beverage",category:byId.get(String(tx.beverageItemRef))?.category,location:tx.locationRef?.name||"Inventory"}));
 const summary={totalItems:items.length,totalStockValue:items.reduce((sum,item)=>sum+item.financials.stockValue,0),alerts:{lowStock:lowStockItems.length,outOfStock:items.filter(item=>item.isActive&&item.stock<=0).length}};
 return {meta:{reportingDate:reportDate,currency:"USD"},items,summary,lowStockItems,expiringItems,recentItems,missingItems:lowStockItems,categoryCosts,stats:[
  {label:"Total Items",value:items.length},{label:"Low Stock",value:lowStockItems.length},{label:"Expiring Soon",value:expiringItems.length},{label:"Categories",value:new Set(itemsRaw.map(item=>String(item.categoryRef?._id||item.categoryRef))).size}
 ]};
}

export default async function getDashboardDataService({business_id,locationRef,reportDate=new Date()}){
 if(!mongoose.isValidObjectId(business_id))throw Object.assign(new Error("A valid business_id is required"),{status:400});
 if(locationRef&&!mongoose.isValidObjectId(locationRef))throw Object.assign(new Error("Invalid locationRef"),{status:400});
 if(Number.isNaN(new Date(reportDate).getTime()))throw Object.assign(new Error("Invalid reporting date"),{status:400});
 const query={business_id,...(locationRef?{locationRef}:{})};
 const [items,balances,lots,transactions]=await Promise.all([
  BeverageItem.find({business_id}).populate({path:"categoryRef",skipInvalidIds:true,transform:(doc,id)=>doc||id}).populate({path:"uomRef",skipInvalidIds:true,transform:(doc,id)=>doc||id}).populate({path:"preferredVendorRef",skipInvalidIds:true,transform:(doc,id)=>doc||id}).lean(),
  InventoryBalance.find(query).lean(),
  InventoryLot.find(query).populate({path:"locationRef",skipInvalidIds:true,transform:(doc,id)=>doc||id}).lean(),
  InventoryTransaction.find(query).populate({path:"locationRef",skipInvalidIds:true,transform:(doc,id)=>doc||id}).sort({createdAt:-1,_id:-1}).lean()
 ]);
 return summarizeInventory(items,balances,lots,transactions,reportDate);
}
