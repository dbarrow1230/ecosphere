// backend/services/inventory/postStockTransferService.js
import mongoose from "mongoose";
import {InventoryBalance,InventoryLot,StockTransfer,StockTransferLine} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";
import upsertInventoryLotService from "./upsertInventoryLotService.js";

const postStockTransferService=async({stockTransferId,approvedByRef})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const transfer=await StockTransfer.findById(stockTransferId,null,{session});
  if(!transfer)throw new Error("Stock transfer not found");
  if(["received","cancelled"].includes(transfer.status))throw new Error("Stock transfer cannot be posted");

  const lines=await StockTransferLine.find({stockTransferRef:transfer._id},null,{session}).sort({createdAt:1,_id:1});
  if(!lines.length)throw new Error("Stock transfer has no lines");

  for(const line of lines){
   const qty=line.qty||0;
   if(qty<=0)continue;

   const fromBalance=await InventoryBalance.findOne({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.fromLocationRef
   },null,{session});

   const fromPrevious=fromBalance?.qtyOnHand||0;
   if(fromPrevious<qty)throw new Error("Insufficient stock for transfer");

   const fromAfter=fromPrevious-qty;

   let fromLot=null;
   if(line.lotRef){
    fromLot=await InventoryLot.findById(line.lotRef,null,{session});
    if(!fromLot)throw new Error("Transfer lot not found");
    fromLot.qtyOnHand=(fromLot.qtyOnHand||0)-qty;
    if(fromLot.qtyOnHand<=0)fromLot.status="depleted";
    await fromLot.save({session});
   }

   await createInventoryTransactionService({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.fromLocationRef,
    lotRef:line.lotRef||null,
    transactionType:"transferOut",
    referenceType:"stockTransfer",
    referenceId:transfer._id,
    qty:-qty,
    unitCost:line.unitCost||0,
    totalCost:qty*(line.unitCost||0),
    balanceAfter:fromAfter,
    reasonCode:"STOCK_TRANSFER_OUT",
    notes:line.notes||"",
    createdByRef:approvedByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.fromLocationRef
   },session);

   const toBalance=await InventoryBalance.findOne({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.toLocationRef
   },null,{session});

   const toPrevious=toBalance?.qtyOnHand||0;
   const toAfter=toPrevious+qty;

   const toLot=fromLot
    ?await upsertInventoryLotService({
      business_id:transfer.business_id,
      beverageItemRef:line.beverageItemRef,
      locationRef:transfer.toLocationRef,
      lotNumber:fromLot.lotNumber,
      expiryDate:fromLot.expiryDate||null,
      receivedDate:new Date(),
      qtyChange:qty,
      unitCost:line.unitCost||0,
      status:"active"
     },session)
    :null;

   await createInventoryTransactionService({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.toLocationRef,
    lotRef:toLot?._id||null,
    transactionType:"transferIn",
    referenceType:"stockTransfer",
    referenceId:transfer._id,
    qty,
    unitCost:line.unitCost||0,
    totalCost:qty*(line.unitCost||0),
    balanceAfter:toAfter,
    reasonCode:"STOCK_TRANSFER_IN",
    notes:line.notes||"",
    createdByRef:approvedByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:transfer.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:transfer.toLocationRef
   },session);
  }

  transfer.status="received";
  transfer.approvedByRef=approvedByRef;
  transfer.shippedAt=transfer.shippedAt||new Date();
  transfer.receivedAt=new Date();
  await transfer.save({session});

  await session.commitTransaction();
  return transfer;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postStockTransferService;