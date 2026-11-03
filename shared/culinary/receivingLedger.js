import {createHash} from "node:crypto";
import {idOf} from "./pricing.js";
export function receivedOrderLines(order,legacyLines=[]){
 return (order.lines||legacyLines).map(line=>{
  const receipts=(order.receipts||[]).filter(receipt=>receipt.status==="posted").flatMap(receipt=>receipt.lines||[]).filter(entry=>idOf(entry.purchaseOrderLineRef)===idOf(line));
  const receivedQty=Number(line.receivedQty||0)+receipts.reduce((sum,entry)=>sum+Number(entry.acceptedQty||0),0),rejectedQty=Number(line.rejectedQty||0)+receipts.reduce((sum,entry)=>sum+Number(entry.rejectedQty||0),0);
  const notFilledQty=Number(line.notFilledQty||0)+receipts.reduce((sum,entry)=>sum+Number(entry.notFilledQty||0),0);
  const replacement=receipts.filter(entry=>entry.outcome==="replaced").at(-1);
  return {...line,...(replacement?{originalProductName:line.productName,productName:replacement.productName,replacementQuantity:replacement.replacementQuantity,unitCost:replacement.unitCost}:{}),receivedQty,rejectedQty,notFilledQty,outcome:receipts.at(-1)?.outcome||null,status:receivedQty+notFilledQty>=line.orderedQty?"received":receivedQty>0?"partialReceived":"open"};
 });
}
export async function inventoryWithOrderReceipts(db,business,includeUnassigned=false,byVendor=false){
 const [inventory,orders]=await Promise.all([db.collection("inventory").find(includeUnassigned?{$or:[{business},{business:null},{business:{$exists:false}}]}:{business}).toArray(),db.collection("purchase_orders").find({business_id:business}).toArray()]);
 const key=row=>[idOf(row.ingredient),idOf(row.locationRef),row.unit,...(byVendor?[idOf(row.vendorRef),row.stockStatus||"ready"]:[])].join(":");
 const result=inventory.map(row=>({...row})),groups=new Map(result.map(row=>[key(row),row]));
 for(const order of orders)for(const receipt of order.receipts||[]){
  if(receipt.status!=="posted")continue;
  for(const line of receipt.lines||[]){
   if(!(line.acceptedQty>0))continue;
   const pending=!line.ingredientRef||!(line.packBaseQuantity>0)||!line.baseUnit;
   if(pending&&!byVendor)continue;
   const quantity=(line.replacementQuantity??line.acceptedQty)*(pending?1:line.packBaseQuantity),stock={business,ingredient:line.ingredientRef||line.vendorIngredientPriceRef||line.purchaseOrderLineRef,locationRef:line.locationRef||receipt.locationRef,unit:pending?"pack":line.baseUnit,...(byVendor?{vendorRef:order.vendorRef,stockStatus:pending?"pendingMeasurement":"ready"}:{})};const k=key(stock);
   let row=groups.get(k);
   if(!row){row={...stock,_id:createHash("sha256").update(idOf(business)+":"+k).digest("hex").slice(0,24),name:line.productName,quantityOnHand:0,committedQuantity:0,receiptDerived:true,lots:[]};groups.set(k,row);result.push(row);}
   row.quantityOnHand=Number(row.quantityOnHand||0)+quantity;
   if(line.lotNumber||line.expiryDate)row.lots=[...(row.lots||[]),{goodsReceiptRef:receipt._id,lotNumber:line.lotNumber,expiryDate:line.expiryDate,quantity}];
  }
 }
 return result;
}
export async function orderReceiptHistory(db,business,vendor){
 const query={business_id:business};if(vendor)query.vendorRef=vendor;
 const [legacy,orders]=await Promise.all([db.collection("goods_receipts").find(query).toArray(),db.collection("purchase_orders").find(query).toArray()]);
 const lines=await db.collection("goods_receipt_lines").find({business_id:business,goodsReceiptRef:{$in:legacy.map(receipt=>receipt._id)}}).toArray();
 return [...legacy.map(receipt=>({...receipt,lines:lines.filter(line=>idOf(line.goodsReceiptRef)===idOf(receipt))})),...orders.flatMap(order=>order.receipts||[])].sort((a,b)=>new Date(b.receiptDate)-new Date(a.receiptDate));
}
