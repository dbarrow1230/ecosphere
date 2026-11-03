// backend/services/inventory/postGoodsReceiptService.js
import mongoose from "mongoose";
import {GoodsReceipt,GoodsReceiptLine,InventoryBalance,PurchaseOrder,PurchaseOrderLine} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";
import upsertInventoryLotService from "./upsertInventoryLotService.js";

const postGoodsReceiptService=async({goodsReceiptId,postedByRef})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const receipt=await GoodsReceipt.findById(goodsReceiptId,null,{session});
  if(!receipt)throw new Error("Goods receipt not found");
  if(receipt.status==="posted")throw new Error("Goods receipt already posted");

  const lines=await GoodsReceiptLine.find({goodsReceiptRef:receipt._id},null,{session}).sort({createdAt:1,_id:1});
  if(!lines.length)throw new Error("Goods receipt has no lines");

  for(const line of lines){
   const acceptedQty=line.acceptedQty??line.receivedQty??0;
   if(acceptedQty<=0)continue;

   const existingBalance=await InventoryBalance.findOne({
    business_id:receipt.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:receipt.locationRef
   },null,{session});

   const previousQty=existingBalance?.qtyOnHand||0;
   const balanceAfter=previousQty+acceptedQty;

   const lot=await upsertInventoryLotService({
    business_id:receipt.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:receipt.locationRef,
    lotNumber:line.lotNumber||"",
    expiryDate:line.expiryDate||null,
    receivedDate:receipt.receiptDate,
    qtyChange:acceptedQty,
    unitCost:line.unitCost||0,
    status:"active"
   },session);

   await createInventoryTransactionService({
    business_id:receipt.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:receipt.locationRef,
    lotRef:lot?._id||null,
    transactionType:"receipt",
    referenceType:"goodsReceipt",
    referenceId:receipt._id,
    qty:acceptedQty,
    unitCost:line.unitCost||0,
    totalCost:acceptedQty*(line.unitCost||0),
    balanceAfter,
    reasonCode:"GOODS_RECEIPT_POSTED",
    notes:line.notes||"",
    createdByRef:postedByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:receipt.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:receipt.locationRef
   },session);

   if(line.purchaseOrderLineRef){
    const poLine=await PurchaseOrderLine.findById(line.purchaseOrderLineRef,null,{session});
    if(poLine){
     poLine.receivedQty=(poLine.receivedQty||0)+acceptedQty;
     poLine.status=poLine.receivedQty>=poLine.orderedQty?"received":"partialReceived";
     await poLine.save({session});
    }
   }
  }

  if(receipt.purchaseOrderRef){
   const poLines=await PurchaseOrderLine.find({purchaseOrderRef:receipt.purchaseOrderRef},null,{session});
   const allReceived=poLines.length&&poLines.every(line=>(line.receivedQty||0)>=(line.orderedQty||0));
   const anyReceived=poLines.some(line=>(line.receivedQty||0)>0);
   await PurchaseOrder.findByIdAndUpdate(receipt.purchaseOrderRef,{
    $set:{status:allReceived?"received":anyReceived?"partialReceived":"sent"}
   },{session});
  }

  receipt.status="posted";
  receipt.postedAt=new Date();
  receipt.postedByRef=postedByRef;
  await receipt.save({session});

  await session.commitTransaction();
  return receipt;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postGoodsReceiptService;