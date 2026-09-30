// backend/services/inventory/recalcInventoryBalanceService.js
import {InventoryBalance,InventoryTransaction} from "../../models/index.js";

const recalcInventoryBalanceService=async({business_id,beverageItemRef,locationRef},session=null)=>{
 const transactions=await InventoryTransaction.find({
  business_id,
  beverageItemRef,
  locationRef
 },null,session?{session}:{})
 .sort({createdAt:1,_id:1})
 .lean();

 let qtyOnHand=0;
 let qtyReserved=0;
 let qtyOnOrder=0;
 let qtyInTransit=0;
 let totalQtyForAvg=0;
 let totalCostForAvg=0;
 let lastCountedAt=null;

 transactions.forEach(tx=>{
  qtyOnHand=tx.balanceAfter;
  if(tx.transactionType==="countVariance")lastCountedAt=tx.createdAt;
  if(tx.transactionType==="receipt"&&tx.qty>0){
   totalQtyForAvg+=tx.qty;
   totalCostForAvg+=(tx.totalCost||0);
  }
 });

 const avgCost=totalQtyForAvg>0?Number((totalCostForAvg/totalQtyForAvg).toFixed(4)):0;
 const qtyAvailable=qtyOnHand-qtyReserved;

 const balance=await InventoryBalance.findOneAndUpdate(
  {business_id,beverageItemRef,locationRef},
  {
   $set:{
    qtyOnHand,
    qtyReserved,
    qtyAvailable,
    qtyOnOrder,
    qtyInTransit,
    avgCost,
    lastCountedAt
   }
  },
  {returnDocument:"after",upsert:true,setDefaultsOnInsert:true,...(session?{session}:{})}
 );

 return balance;
};

export default recalcInventoryBalanceService;