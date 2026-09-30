// backend/services/inventory/postWasteRecordService.js
import mongoose from "mongoose";
import {InventoryBalance,InventoryLot,WasteRecord} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";

const postWasteRecordService=async({wasteRecordId})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const waste=await WasteRecord.findById(wasteRecordId,null,{session});
  if(!waste)throw new Error("Waste record not found");

  const qty=waste.qty||0;
  if(qty<=0)throw new Error("Waste quantity must be greater than zero");

  const balance=await InventoryBalance.findOne({
   business_id:waste.business_id,
   beverageItemRef:waste.beverageItemRef,
   locationRef:waste.locationRef
  },null,{session});

  const previousQty=balance?.qtyOnHand||0;
  if(previousQty<qty)throw new Error("Insufficient stock for waste record");

  const nextQty=previousQty-qty;

  if(waste.lotRef){
   const lot=await InventoryLot.findById(waste.lotRef,null,{session});
   if(lot){
    lot.qtyOnHand=(lot.qtyOnHand||0)-qty;
    if(lot.qtyOnHand<=0)lot.status="depleted";
    await lot.save({session});
   }
  }

  await createInventoryTransactionService({
   business_id:waste.business_id,
   beverageItemRef:waste.beverageItemRef,
   locationRef:waste.locationRef,
   lotRef:waste.lotRef||null,
   transactionType:"waste",
   referenceType:"manual",
   referenceId:waste._id,
   qty:-qty,
   unitCost:qty>0?(waste.cost||0)/qty:0,
   totalCost:waste.cost||0,
   balanceAfter:nextQty,
   reasonCode:waste.reason||"WASTE",
   notes:waste.notes||"",
   createdByRef:waste.createdByRef
  },session);

  await recalcInventoryBalanceService({
   business_id:waste.business_id,
   beverageItemRef:waste.beverageItemRef,
   locationRef:waste.locationRef
  },session);

  await session.commitTransaction();
  return waste;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postWasteRecordService;