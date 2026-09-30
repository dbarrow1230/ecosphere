// backend/services/inventory/postVendorReturnService.js
import mongoose from "mongoose";
import {InventoryBalance,InventoryLot,VendorReturn,VendorReturnLine} from "../../models/index.js";
import createInventoryTransactionService from "./createInventoryTransactionService.js";
import recalcInventoryBalanceService from "./recalcInventoryBalanceService.js";

const postVendorReturnService=async({vendorReturnId,createdByRef})=>{
 const session=await mongoose.startSession();
 try{
  session.startTransaction();

  const vendorReturn=await VendorReturn.findById(vendorReturnId,null,{session});
  if(!vendorReturn)throw new Error("Vendor return not found");
  if(vendorReturn.status==="completed")throw new Error("Vendor return already completed");

  const lines=await VendorReturnLine.find({vendorReturnRef:vendorReturn._id},null,{session}).sort({createdAt:1,_id:1});
  if(!lines.length)throw new Error("Vendor return has no lines");

  for(const line of lines){
   const qty=line.qty||0;
   if(qty<=0)continue;

   const balance=await InventoryBalance.findOne({
    business_id:vendorReturn.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:vendorReturn.locationRef
   },null,{session});

   const previousQty=balance?.qtyOnHand||0;
   if(previousQty<qty)throw new Error("Insufficient stock for vendor return");

   const nextQty=previousQty-qty;

   if(line.lotRef){
    const lot=await InventoryLot.findById(line.lotRef,null,{session});
    if(lot){
      lot.qtyOnHand=(lot.qtyOnHand||0)-qty;
      if(lot.qtyOnHand<=0)lot.status="depleted";
      await lot.save({session});
    }
   }

   await createInventoryTransactionService({
    business_id:vendorReturn.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:vendorReturn.locationRef,
    lotRef:line.lotRef||null,
    transactionType:"returnToVendor",
    referenceType:"vendorReturn",
    referenceId:vendorReturn._id,
    qty:-qty,
    unitCost:line.unitCost||0,
    totalCost:line.lineTotal||qty*(line.unitCost||0),
    balanceAfter:nextQty,
    reasonCode:line.reasonCode||vendorReturn.reason||"VENDOR_RETURN",
    notes:line.notes||vendorReturn.notes||"",
    createdByRef
   },session);

   await recalcInventoryBalanceService({
    business_id:vendorReturn.business_id,
    beverageItemRef:line.beverageItemRef,
    locationRef:vendorReturn.locationRef
   },session);
  }

  vendorReturn.status="completed";
  await vendorReturn.save({session});

  await session.commitTransaction();
  return vendorReturn;
 }catch(error){
  await session.abortTransaction();
  throw error;
 }finally{
  session.endSession();
 }
};

export default postVendorReturnService;