// backend/services/inventory/createInventoryTransactionService.js
import {InventoryTransaction} from "../../models/index.js";

const createInventoryTransactionService=async(payload={},session=null)=>{
 const doc={
  business_id:payload.business_id,
  beverageItemRef:payload.beverageItemRef,
  locationRef:payload.locationRef,
  lotRef:payload.lotRef||null,
  transactionType:payload.transactionType,
  referenceType:payload.referenceType,
  referenceId:payload.referenceId||null,
  qty:payload.qty||0,
  unitCost:payload.unitCost||0,
  totalCost:payload.totalCost??((payload.qty||0)*(payload.unitCost||0)),
  balanceAfter:payload.balanceAfter||0,
  reasonCode:payload.reasonCode||"",
  notes:payload.notes||"",
  createdByRef:payload.createdByRef
 };
 const transaction=await InventoryTransaction.create([doc],session?{session}:{});
 return transaction[0];
};

export default createInventoryTransactionService;