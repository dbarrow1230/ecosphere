import {orderTotals} from "../../../lib/orderImport.js";
import {receivedOrderLines} from "../../../../shared/culinary/receivingLedger.js";
import {createHash} from "node:crypto";
import {idOf,normalizeOffer,unitDefinition} from "../../../../shared/culinary/pricing.js";

export const orderTransitions={draft:["submitted","cancelled"],submitted:["approved","cancelled"],approved:["sent","cancelled"],sent:["cancelled","closed"],partialReceived:["closed"],received:["closed"],closed:[],cancelled:[]};
export function assertOrderTransition(order,status,{cancelOutstanding=false}={}){
 if(!(order.orderType==="grocery"&&order.status==="draft"&&status==="sent")&&!orderTransitions[order.status]?.includes(status))throw new Error("This order cannot move to that status.");
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
export function makeGroceryLines(input,offers,ingredients,records,business,vendor){
 if(!Array.isArray(input)||!input.length)throw Error("Add grocery items.");
 return input.map((line,index)=>{const quantity=Number(line.quantity),unitCost=Number(line.unitCost),lineTotal=line.lineTotal===""||line.lineTotal==null?quantity*unitCost:Number(line.lineTotal);if(!line.productName?.trim()||!Number.isFinite(quantity)||quantity<=0||![unitCost,lineTotal].every(value=>Number.isFinite(value)&&value>=0))throw Error("Enter the item name, requested quantity, price, and total for every grocery line.");
 const offer=line.offering?offers.find(item=>idOf(item)===idOf(line.offering)&&idOf(item.business)===idOf(business)&&idOf(item.vendor)===idOf(vendor)&&item.isActive!==false):null;if(line.offering&&!offer)throw Error("Choose a product from this vendor.");const ingredient=offer&&ingredients.find(item=>idOf(item)===idOf(offer.ingredient));
 const unit=line.purchaseUnit||"pack",definition=unit!=="pack"?unitDefinition(unit,records):null,pack=offer&&normalizeOffer(offer,records);if(unit!=="pack"&&!definition)throw Error("Choose a supported purchased unit.");
 return {lineNumber:index+1,ingredientRef:ingredient?._id||null,vendorIngredientPriceRef:offer?._id||null,productName:line.productName.trim(),brand:offer?.brand||"",packDisplay:line.packDisplay||unit,packBaseQuantity:definition?.factor||pack?.baseQuantity||null,baseUnit:definition?.baseUnit||pack?.baseUnit||null,purchaseUnit:unit,orderedQty:quantity,receivedQty:0,rejectedQty:0,notFilledQty:0,unitCost,lineTotal,status:"open",taxable:line.taxable===true,sourceAvailability:line.sourceAvailability||"unverified",quantityNeedsReview:Boolean(line.quantityNeedsReview)};
 });
}
export function receiptChanges(order,orderLines,input){
 if(!["sent","partialReceived"].includes(order.status))throw new Error("Only sent orders can be received.");
 if(!Array.isArray(input)||!input.length)throw new Error("Enter received quantities.");
 const seen=new Set();
 const changes=input.map(value=>{
  const line=orderLines.find(item=>idOf(item)===idOf(value.line));
  if(!line)throw new Error("An item was removed from this order. Reopen the receiving record to load the updated items.");
  if(seen.has(idOf(line)))throw new Error("The same order line was submitted twice.");
  seen.add(idOf(line));
  const remaining=line.orderedQty-(line.receivedQty||0)-(line.notFilledQty||0),accepted=value.outcome==="replaced"?remaining:Number(value.accepted||0),rejected=Number(value.rejected||0),notFilled=Number(value.notFilled||0);
  if(!Number.isFinite(accepted)||!Number.isFinite(rejected)||accepted<0||rejected<0||!Number.isFinite(notFilled)||notFilled<0||accepted+rejected+notFilled>remaining+1e-9)throw new Error("Received quantities must be nonnegative and cannot exceed the outstanding packs.");
  if(value.expiryDate&&Number.isNaN(Date.parse(value.expiryDate)))throw new Error("Enter a valid expiry date.");
  const replacement=value.outcome==="replaced"?{productName:String(value.replacementName||"").trim(),unitCost:Number(value.replacementPrice),quantity:Number(value.replacementQuantity)}:null;
  if(replacement&&(!replacement.productName||value.replacementPrice===""||!Number.isFinite(replacement.unitCost)||replacement.unitCost<0||!Number.isFinite(replacement.quantity)||replacement.quantity<=0||accepted<=0))throw Error("Enter the replacement item, quantity, and price for "+line.productName+".");
  return {line,accepted,rejected,notFilled,replacement,outcome:["notReceived","notFilled","replaced"].includes(value.outcome)?value.outcome:"received",lotNumber:String(value.lotNumber||"").trim(),expiryDate:value.expiryDate?new Date(value.expiryDate):null};
 }).filter(item=>item.accepted+item.rejected+item.notFilled>0);
 if(!changes.length)throw new Error("Enter at least one received or rejected quantity.");
 return changes;
}
export async function postIngredientReceipt({connection,ObjectId,business,orderId,user,token,input,invoiceNumber="",notes="",deliveryDate="",onTime=null}){
 if(typeof token!=="string"||token.length<8||token.length>100)throw new Error("A receipt reference is required.");
 if(deliveryDate&&Number.isNaN(Date.parse(deliveryDate)))throw new Error("Enter a valid delivery date.");
 if(onTime!==null&&typeof onTime!=="boolean")throw new Error("Choose on time, late, or automatic.");
 const signature=createHash("sha256").update(JSON.stringify({order:idOf(orderId),input,invoiceNumber,notes,deliveryDate,onTime})).digest("hex"),db=connection.db;
 for(let attempt=0;attempt<5;attempt++){
  const order=await db.collection("purchase_orders").findOne({_id:orderId,business_id:business});
  if(!order)throw new Error("Order not found.");
  const previous=(order.receipts||[]).find(receipt=>receipt.receiptToken===token);
  if(previous){if(previous.inputSignature!==signature)throw new Error("This receipt reference has already been used.");return previous;}
  const legacy=order.lines?[]:await db.collection("purchase_order_lines").find({purchaseOrderRef:orderId,business_id:business}).toArray();
  const orderLines=receivedOrderLines(order,legacy).map(line=>{const value=input.find(value=>idOf(value.line)===idOf(line)),mapped=value?.mappedProduct;if(value?.outcome==="replaced")return {...line,ingredientRef:null,vendorIngredientPriceRef:null,packBaseQuantity:null,baseUnit:null,...mapped};if(!mapped)return line;return {...line,...mapped,...(line.purchaseUnit&&line.purchaseUnit!=="pack"?{packBaseQuantity:line.packBaseQuantity,baseUnit:line.baseUnit}:{} )};}),changes=receiptChanges(order,orderLines,input),receiptId=new ObjectId(),now=new Date();
  const receipt={_id:receiptId,business_id:business,vendorRef:order.vendorRef,locationRef:order.locationRef,purchaseOrderRef:orderId,receiptNumber:`GR-${now.toISOString().slice(0,10).replaceAll("-","")}-${idOf(receiptId).slice(-6).toUpperCase()}`,receiptToken:token,inputSignature:signature,invoiceNumber:order.orderType==="grocery"?String(order.orderReference||order.poNumber):String(invoiceNumber).trim(),notes:String(notes).trim(),receiptDate:now,deliveryDate:deliveryDate?new Date(deliveryDate):now,onTime,receivedByRef:user,postedByRef:user,postedAt:now,status:"posted",flow:"ingredients",postingMode:"orderLedger",createdAt:now,updatedAt:now,
   lines:changes.map(({line,accepted,rejected,notFilled,outcome,replacement,lotNumber,expiryDate})=>({_id:new ObjectId(),business_id:business,goodsReceiptRef:receiptId,purchaseOrderLineRef:line._id,ingredientRef:line.ingredientRef,vendorIngredientPriceRef:line.vendorIngredientPriceRef,productName:replacement?.productName||line.productName,originalProductName:replacement?line.productName:null,replacementQuantity:replacement?.quantity||null,locationRef:replacement?null:line.locationRef||null,receivedQty:accepted+rejected,acceptedQty:accepted,stockStatus:accepted>0&&(!line.ingredientRef||!(line.packBaseQuantity>0)||!line.baseUnit)?"pendingMeasurement":"ready",rejectedQty:rejected,notFilledQty:notFilled,outcome,packBaseQuantity:line.packBaseQuantity,baseUnit:line.baseUnit,unitCost:replacement?.unitCost??line.unitCost,lineTotal:replacement?replacement.quantity*replacement.unitCost:accepted*line.unitCost,lotNumber,expiryDate}))};
  receipt.subtotal=receipt.lines.reduce((sum,line)=>sum+line.lineTotal,0);receipt.total=receipt.subtotal;
  const updated=receivedOrderLines({...order,receipts:[...(order.receipts||[]),receipt]},legacy),complete=updated.every(line=>line.receivedQty+(line.notFilledQty||0)>=line.orderedQty),partial=updated.some(line=>line.receivedQty>0);
  const corrections={};if(changes.some(change=>change.replacement)&&order.lines){corrections.lines=order.lines.map(line=>{const change=changes.find(change=>idOf(change.line)===idOf(line)&&change.replacement);return change?{...line,lineTotal:Number((Number(line.lineTotal||0)-change.accepted*Number(line.unitCost||0)+change.replacement.quantity*change.replacement.unitCost).toFixed(2))}:line;});const totals=orderTotals({...order,subtotal:""},corrections.lines);Object.assign(corrections,{subtotal:Number(totals.subtotal.toFixed(2)),calculatedSubtotal:Number(totals.subtotal.toFixed(2)),taxableSubtotal:totals.taxableSubtotal,tax:totals.tax,total:totals.total});}
  const result=await db.collection("purchase_orders").updateOne({_id:orderId,business_id:business,status:order.status,receiptVersion:order.receiptVersion===undefined?{$exists:false}:order.receiptVersion},{$push:{receipts:receipt},$inc:{receiptVersion:1},$set:{...corrections,status:complete?"received":partial?"partialReceived":"sent",hasReceipts:true,updatedAt:now}});
  if(result.matchedCount)return receipt;
 }
 throw new Error("The order changed during receiving. Reload and try again.");
}
