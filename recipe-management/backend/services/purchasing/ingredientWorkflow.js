import {receivedOrderLines} from "../../../../shared/culinary/receivingLedger.js";
import {createHash} from "node:crypto";
import {idOf,normalizeOffer} from "../../../../shared/culinary/pricing.js";

export const orderTransitions={draft:["submitted","cancelled"],submitted:["approved","cancelled"],approved:["sent","cancelled"],sent:["cancelled","closed"],partialReceived:["closed"],received:["closed"],closed:[],cancelled:[]};
export function assertOrderTransition(order,status,{cancelOutstanding=false}={}){
 if(!orderTransitions[order.status]?.includes(status))throw new Error("This order cannot move to that status.");
 if(status==="closed"&&order.status!=="received"&&(!cancelOutstanding||!order.hasReceipts))throw new Error("Explicitly cancel the outstanding packs to close this order.");
 if(status==="cancelled"&&order.hasReceipts)throw new Error("An order with receipts cannot be cancelled.");
}
export function makeOrderLines(input,offers,ingredients,records,business,vendor){
 if(!Array.isArray(input)||!input.length)throw new Error("Add at least one product.");
 const seen=new Set();
 return input.map((line,index)=>{
  const offer=offers.find(item=>idOf(item)===idOf(line.offering)&&idOf(item.business)===idOf(business)&&idOf(item.vendor)===idOf(vendor)&&item.isActive!==false);
  if(!offer||seen.has(idOf(offer)))throw new Error("Choose each active vendor product only once.");
  seen.add(idOf(offer));
  const quantity=Number(line.quantity),pack=normalizeOffer(offer,records);
  if(!Number.isInteger(quantity)||quantity<=0)throw new Error("Order quantities must be positive whole packs.");
  if(!pack)throw new Error("The vendor product needs a measured pack size and price.");
  const ingredient=ingredients.find(item=>idOf(item)===idOf(offer.ingredient));
  if(!ingredient||ingredient.isActive===false)throw new Error("The ingredient is unavailable.");
  return {lineNumber:index+1,ingredientRef:offer.ingredient,vendorIngredientPriceRef:offer._id,productName:ingredient.name||ingredient.ingredientName,brand:offer.brand||"",packDisplay:offer.imperialDisplay||offer.metricDisplay||offer.packSizeName||"",packBaseQuantity:pack.baseQuantity,baseUnit:pack.baseUnit,orderedQty:quantity,receivedQty:0,rejectedQty:0,unitCost:pack.packCost,lineTotal:quantity*pack.packCost,status:"open"};
 });
}
export function receiptChanges(order,orderLines,input){
 if(!["sent","partialReceived"].includes(order.status))throw new Error("Only sent orders can be received.");
 if(!Array.isArray(input)||!input.length)throw new Error("Enter received quantities.");
 const seen=new Set();
 const changes=input.map(value=>{
  const line=orderLines.find(item=>idOf(item)===idOf(value.line));
  if(!line||!line.ingredientRef||!line.packBaseQuantity||seen.has(idOf(line)))throw new Error("Choose each ingredient order line only once.");
  seen.add(idOf(line));
  const accepted=Number(value.accepted||0),rejected=Number(value.rejected||0),remaining=line.orderedQty-(line.receivedQty||0);
  if(!Number.isFinite(accepted)||!Number.isFinite(rejected)||accepted<0||rejected<0||accepted+rejected>remaining+1e-9)throw new Error("Received quantities must be nonnegative and cannot exceed the outstanding packs.");
  if(value.expiryDate&&Number.isNaN(Date.parse(value.expiryDate)))throw new Error("Enter a valid expiry date.");
  return {line,accepted,rejected,lotNumber:String(value.lotNumber||"").trim(),expiryDate:value.expiryDate?new Date(value.expiryDate):null};
 }).filter(item=>item.accepted+item.rejected>0);
 if(!changes.length)throw new Error("Enter at least one received or rejected quantity.");
 return changes;
}
export async function postIngredientReceipt({connection,ObjectId,business,orderId,user,token,input,invoiceNumber="",notes=""}){
 if(typeof token!=="string"||token.length<8||token.length>100)throw new Error("A receipt reference is required.");
 const signature=createHash("sha256").update(JSON.stringify({order:idOf(orderId),input,invoiceNumber,notes})).digest("hex"),db=connection.db;
 for(let attempt=0;attempt<5;attempt++){
  const order=await db.collection("purchase_orders").findOne({_id:orderId,business_id:business});
  if(!order)throw new Error("Order not found.");
  const previous=(order.receipts||[]).find(receipt=>receipt.receiptToken===token);
  if(previous){if(previous.inputSignature!==signature)throw new Error("This receipt reference has already been used.");return previous;}
  const legacy=order.lines?[]:await db.collection("purchase_order_lines").find({purchaseOrderRef:orderId,business_id:business}).toArray();
  const orderLines=receivedOrderLines(order,legacy),changes=receiptChanges(order,orderLines,input),receiptId=new ObjectId(),now=new Date();
  const receipt={_id:receiptId,business_id:business,vendorRef:order.vendorRef,locationRef:order.locationRef,purchaseOrderRef:orderId,receiptNumber:`GR-${now.toISOString().slice(0,10).replaceAll("-","")}-${idOf(receiptId).slice(-6).toUpperCase()}`,receiptToken:token,inputSignature:signature,invoiceNumber:String(invoiceNumber).trim(),notes:String(notes).trim(),receiptDate:now,receivedByRef:user,postedByRef:user,postedAt:now,status:"posted",flow:"ingredients",postingMode:"orderLedger",createdAt:now,updatedAt:now,
   lines:changes.map(({line,accepted,rejected,lotNumber,expiryDate})=>({_id:new ObjectId(),business_id:business,goodsReceiptRef:receiptId,purchaseOrderLineRef:line._id,ingredientRef:line.ingredientRef,vendorIngredientPriceRef:line.vendorIngredientPriceRef,productName:line.productName,receivedQty:accepted+rejected,acceptedQty:accepted,rejectedQty:rejected,packBaseQuantity:line.packBaseQuantity,baseUnit:line.baseUnit,unitCost:line.unitCost,lineTotal:accepted*line.unitCost,lotNumber,expiryDate}))};
  receipt.subtotal=receipt.lines.reduce((sum,line)=>sum+line.lineTotal,0);receipt.total=receipt.subtotal;
  const updated=receivedOrderLines({...order,receipts:[...(order.receipts||[]),receipt]},legacy),complete=updated.every(line=>line.receivedQty>=line.orderedQty),partial=updated.some(line=>line.receivedQty>0);
  const result=await db.collection("purchase_orders").updateOne({_id:orderId,business_id:business,status:order.status,receiptVersion:order.receiptVersion===undefined?{$exists:false}:order.receiptVersion},{$push:{receipts:receipt},$inc:{receiptVersion:1},$set:{status:complete?"received":partial?"partialReceived":"sent",hasReceipts:true,updatedAt:now}});
  if(result.matchedCount)return receipt;
 }
 throw new Error("The order changed during receiving. Reload and try again.");
}
