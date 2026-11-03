// backend/services/inventory/postStockAdjustmentService.js
import mongoose from "mongoose";
import {InventoryBalance,InventoryLot,StockAdjustment,StockAdjustmentLine} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";
import upsertInventoryLotService from "./upsertInventoryLotService.js";

const postStockAdjustmentService=async({stockAdjustmentId,approvedByRef})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const adjustment=await StockAdjustment.findById(stockAdjustmentId,null,{session});
  if(!adjustment)throw new Error("Stock adjustment not found");
  if(adjustment.status==="posted")throw new Error("Stock adjustment already posted");

  const lines=await StockAdjustmentLine.find({stockAdjustmentRef:adjustment._id},null,{session}).sort({createdAt:1,_id:1});
  if(!lines.length)throw new Error("Stock adjustment has no lines");

  for(const line of lines){
   const balance=await InventoryBalance.findOne({
    business_id:adjustment.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:adjustment.locationRef
   },null,{session});

   const previousQty=balance?.qtyOnHand||0;
   const nextQty=previousQty+(line.qty||0);
   if(nextQty<0)throw new Error("Adjustment cannot reduce stock below zero");

   if(line.lotRef){
    const lot=await InventoryLot.findById(line.lotRef,null,{session});
    if(lot){
     lot.qtyOnHand=(lot.qtyOnHand||0)+(line.qty||0);
     lot.status=lot.qtyOnHand<=0?"depleted":"active";
     await lot.save({session});
    }
   }

   await createInventoryTransactionService({
    business_id:adjustment.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:adjustment.locationRef,
    lotRef:line.lotRef||null,
    transactionType:"adjustment",
    referenceType:"stockAdjustment",
    referenceId:adjustment._id,
    qty:line.qty||0,
    unitCost:line.unitCost||0,
    totalCost:line.totalCost||0,
    balanceAfter:nextQty,
    reasonCode:line.reasonCode||adjustment.reason||"STOCK_ADJUSTMENT",
    notes:line.notes||adjustment.notes||"",
    createdByRef:approvedByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:adjustment.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:adjustment.locationRef
   },session);
  }

  adjustment.status="posted";
  adjustment.approvedByRef=approvedByRef;
  adjustment.approvedAt=new Date();
  await adjustment.save({session});

  await session.commitTransaction();
  return adjustment;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postStockAdjustmentService;