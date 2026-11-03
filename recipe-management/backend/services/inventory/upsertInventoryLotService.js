// backend/services/inventory/upsertInventoryLotService.js
import {InventoryLot} from "../../models/index.js";

const upsertInventoryLotService=async({
 business_id,
 beverageItemRef,
 locationRef,
 lotNumber,
 expiryDate=null,
 receivedDate=null,
 qtyChange=0,
 unitCost=0,
 status="active"
},session=null)=>{
 if(!lotNumber)return null;

 const existing=await InventoryLot.findOne({
  business_id,
  beverageItemRef,
  locationRef,
  lotNumber
 },null,session?{session}:{});

 if(existing){
  existing.qtyOnHand=(existing.qtyOnHand||0)+qtyChange;
  if(expiryDate)existing.expiryDate=expiryDate;
  if(receivedDate)existing.receivedDate=receivedDate;
  if(unitCost)existing.unitCost=unitCost;
  if(existing.qtyOnHand<=0)existing.status="depleted";
  else existing.status=status;
  await existing.save(session?{session}:{});
  return existing;
 }

 const created=await InventoryLot.create([{
  business_id,
  beverageItemRef,
  locationRef,
  lotNumber,
  expiryDate,
  receivedDate,
  qtyOnHand:qtyChange,
  unitCost,
  status:qtyChange<=0?"depleted":status
 }],session?{session}:{});

 return created[0];
};

export default upsertInventoryLotService;