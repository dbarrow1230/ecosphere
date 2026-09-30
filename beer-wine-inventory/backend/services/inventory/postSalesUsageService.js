// backend/services/inventory/postSalesUsageService.js
import mongoose from "mongoose";
import {InventoryBalance,InventoryLot,SalesUsage,SalesUsageLine} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";

const postSalesUsageService=async({salesUsageId,createdByRef})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const usage=await SalesUsage.findById(salesUsageId,null,{session});
  if(!usage)throw new Error("Sales usage not found");

  const lines=await SalesUsageLine.find({salesUsageRef:usage._id},null,{session}).sort({createdAt:1,_id:1});
  if(!lines.length)throw new Error("Sales usage has no lines");

  for(const line of lines){
   const qty=line.qtyConsumed||line.qtySold||0;
   if(qty<=0)continue;

   const balance=await InventoryBalance.findOne({
    business_id:usage.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:usage.locationRef
   },null,{session});

   const previousQty=balance?.qtyOnHand||0;
   if(previousQty<qty)throw new Error("Insufficient stock for sales usage");

   const nextQty=previousQty-qty;

   const lot=await InventoryLot.findOne({
    business_id:usage.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:usage.locationRef,
    status:"active"
   },null,{session}).sort({expiryDate:1,receivedDate:1,createdAt:1});

   if(lot){
    lot.qtyOnHand=(lot.qtyOnHand||0)-qty;
    if(lot.qtyOnHand<=0)lot.status="depleted";
    await lot.save({session});
   }

   await createInventoryTransactionService({
    business_id:usage.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:usage.locationRef,
    lotRef:lot?._id||null,
    transactionType:"issue",
    referenceType:"salesUsage",
    referenceId:usage._id,
    qty:-qty,
    unitCost:qty>0?(line.cost||0)/qty:0,
    totalCost:line.cost||0,
    balanceAfter:nextQty,
    reasonCode:"SALES_USAGE_POSTED",
    notes:"",
    createdByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:usage.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:usage.locationRef
   },session);
  }

  await session.commitTransaction();
  return usage;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postSalesUsageService;