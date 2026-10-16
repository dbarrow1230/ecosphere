import {preserveOrderHistory} from "../../services/purchasing/orderCorrection.js";
import {correctOrderDates} from "../../services/purchasing/orderDateCorrection.js";
import {storageArea} from "../../../lib/stockDisplay.js";
import {addOrderVendorProduct} from "../../services/purchasing/addOrderVendorProduct.js";
import {reserveOrderNumber} from "../../services/purchasing/orderNumbers.js";
import {orderTotals,calculateOrderTax} from "../../../lib/orderImport.js";
import {vendorDeliveryPerformance} from "../../services/purchasing/vendorPerformance.js";
import {receivedOrderLines,inventoryWithOrderReceipts,orderReceiptHistory} from "../../../../shared/culinary/receivingLedger.js";
import express from "express";
import mongoose from "mongoose";
import businessConnection from "../../db/businessInfoConnection.js";
import {idOf,normalizeOffer} from "../../../../shared/culinary/pricing.js";
import {assertOrderTransition,makeOrderLines,makeGroceryLines,postIngredientReceipt} from "../../services/purchasing/ingredientWorkflow.js";

const router=express.Router(),ObjectId=mongoose.Types.ObjectId;
const oid=value=>{if(!ObjectId.isValid(idOf(value)))throw new Error("A valid record is required.");return new ObjectId(idOf(value));};
const guard=handler=>async(req,res)=>{
 try{await businessConnection.asPromise();const business=oid(req.query.business||req.body?.business);await handler(req,res,business);}
 catch(error){res.status(error.code===11000?409:400).json({message:error.code===11000?"This order or receipt already exists.":error.message});}
};
const reference=()=>businessConnection.db,local=()=>mongoose.connection.db;
const actor=req=>oid(req.user?._id||req.user?.id||req.body.user);
const units=async()=>[...await reference().collection("imperial_units").find({}).toArray(),...await reference().collection("metric_units").find({}).toArray()];

router.get("/vendor-performance",guard(async(req,res,business)=>{const orders=await local().collection("purchase_orders").find({business_id:business,flow:"ingredients",status:{$in:["received","closed"]}}).toArray();const lines=await local().collection("purchase_order_lines").find({business_id:business,purchaseOrderRef:{$in:orders.map(order=>order._id)}}).toArray();res.json(vendorDeliveryPerformance(orders,lines));}));

async function businessTax(business){const record=await reference().collection("businesses").findOne({_id:business});if(!record?.taxRateRef)return null;const rate=await reference().collection("tax_rates").findOne({_id:record.taxRateRef,isActive:{$ne:false}});if(!rate)return null;const state=await reference().collection("states").findOne({_id:rate.stateRef});return {...rate,state:state?{name:state.name,abbreviation:state.abbreviation}:null};}

router.post("/vendor-product",guard(async(req,res,business)=>{const vendorIngredientPrice=await addOrderVendorProduct(reference(),ObjectId,{business,vendor:oid(req.body.vendor),line:req.body.line||{},effectiveDate:req.body.effectiveDate});res.status(201).json({vendorIngredientPrice});}));

router.post("/order-number",guard(async(req,res,business)=>{const vendor=await reference().collection("vendors").findOne({_id:oid(req.body.vendor),isActive:{$ne:false}});if(!vendor)throw Error("Choose an active vendor.");res.json({orderNumber:await reserveOrderNumber(local(),business,req.body.orderType||"purchase",req.body.orderDate||new Date().toISOString().slice(0,10),vendor.legalName||vendor.name)});}));

router.get("/options",guard(async(req,res,business)=>{
 const [vendors,offers,ingredients,locations,records]=await Promise.all([
  reference().collection("vendors").find({isActive:{$ne:false}}).sort({legalName:1}).toArray(),reference().collection("vendor_ingredient_prices").find({business,isActive:{$ne:false}}).toArray(),reference().collection("ingredients").find({$or:[{business},{business:null},{business:{$exists:false}}]}).toArray(),reference().collection("locations").find({business,isActive:{$ne:false}}).sort({name:1}).toArray(),units()
 ]);
 let sourceRecipe=null;
 if(req.query.recipe){
  const recipe=await reference().collection("recipes").findOne({_id:oid(req.query.recipe),business});
  if(!recipe)throw new Error("Recipe not found for this business.");
  const costing=await reference().collection("recipe_costings").findOne({recipe:recipe._id,business,isActive:{$ne:false}});
  sourceRecipe={_id:recipe._id,name:recipe.name,ingredients:costing?.ingredients||recipe.ingredients||[]};
 }
 const locationTypes=await reference().collection("location_types").find({isActive:{$ne:false}}).sort({name:1}).toArray();
 res.json({vendors,offers,ingredients,locations,records,sourceRecipe,locationTypes,taxRate:await businessTax(business)});
}));
router.get("/orders",guard(async(req,res,business)=>{
 const query={business_id:business};if(req.query.vendor)query.vendorRef=oid(req.query.vendor);
 const orders=await local().collection("purchase_orders").find(query).sort({createdAt:-1}).limit(100).toArray();
 const lines=await local().collection("purchase_order_lines").find({business_id:business,purchaseOrderRef:{$in:orders.map(order=>order._id)}}).sort({lineNumber:1}).toArray();
 res.json(orders.map(order=>({...order,lines:receivedOrderLines(order,lines.filter(line=>idOf(line.purchaseOrderRef)===idOf(order)))})));
}));
router.get("/receipts",guard(async(req,res,business)=>{res.json(await orderReceiptHistory(local(),business,req.query.vendor?oid(req.query.vendor):null));}));
router.get("/inventory",guard(async(req,res,business)=>{const locations=await reference().collection("locations").find({business,isActive:{$ne:false}}).toArray();const rows=(await inventoryWithOrderReceipts(local(),business,false,true)).map(row=>({...row,locationRef:row.locationRef||locations.find(location=>location.name===storageArea(row.name))?._id||null}));res.json(req.query.vendor?rows.filter(row=>idOf(row.vendorRef)===req.query.vendor):rows);}));
const saveDraft=guard(async(req,res,business)=>{
 const vendor=oid(req.body.vendor),location=req.body.location?oid(req.body.location):null,user=actor(req);
 const [vendorRecord,locationRecord,offers,ingredients,records]=await Promise.all([
  reference().collection("vendors").findOne({_id:vendor,isActive:{$ne:false}}),reference().collection("locations").findOne({_id:location,business,isActive:{$ne:false}}),reference().collection("vendor_ingredient_prices").find({vendor,business,isActive:{$ne:false}}).toArray(),reference().collection("ingredients").find({$or:[{business},{business:null},{business:{$exists:false}}]}).toArray(),units()
 ]);
 if(!vendorRecord||(location&&!locationRecord))throw new Error("Choose an active vendor and business location.");
 const orderType=req.body.orderType||"purchase";if(!["purchase","grocery"].includes(orderType))throw Error("Choose grocery or purchase order.");
 const lines=(orderType==="grocery"?makeGroceryLines:makeOrderLines)(req.body.lines,offers,ingredients,records,business,vendor),orderId=req.params.id?oid(req.params.id):new ObjectId(),now=new Date();
 const storageLocations=await reference().collection("locations").find({business,isActive:{$ne:false}}).toArray();for(const line of lines)line.locationRef=storageLocations.find(location=>location.name===storageArea(line.productName))?._id||null;
 const extra=name=>{const value=Number(req.body[name]||0);if(!Number.isFinite(value)||value<0)throw new Error(`Enter a valid ${name}.`);return value;};
 const expectedDate=req.body.expectedDate?new Date(req.body.expectedDate):null;
 if(expectedDate&&Number.isNaN(expectedDate.getTime()))throw new Error("Enter a valid expected date.");
 const orderDate=req.body.orderDate?new Date(req.body.orderDate):now;if(Number.isNaN(orderDate.getTime()))throw Error("Enter a valid order date.");if(orderType!=="grocery"&&Number(req.body.tip||0)>0)throw Error("Tips are only available for grocery orders.");
 const orderReference=String(req.body.orderReference||"").trim();if(!orderReference)throw Error("Generate or enter an order number before saving.");const orderReferenceKey=orderReference.toUpperCase();await local().collection("purchase_orders").createIndex({business_id:1,orderReferenceKey:1},{unique:true,partialFilterExpression:{orderReferenceKey:{$type:"string"}}});if(await local().collection("purchase_orders").findOne({business_id:business,_id:{$ne:orderId},$or:[{orderReferenceKey},{orderReference},{poNumber:orderReference}]}))throw Error("This order number is already used for this business.");
 const order={_id:orderId,orderType,orderReference,orderReferenceKey,business_id:business,vendorRef:vendor,locationRef:location,poNumber:`${orderType==="grocery"?"GO":"PO"}-${now.toISOString().slice(0,10).replaceAll("-","")}-${idOf(orderId).slice(-6).toUpperCase()}`,status:"draft",flow:"ingredients",orderDate,expectedDate,currency:vendorRecord.payment?.currencyCode||"USD",subtotal:lines.reduce((sum,line)=>sum+line.lineTotal,0),shipping:extra("shipping"),tax:extra("tax"),createdByRef:user,notes:String(req.body.notes||"").trim(),createdAt:now,updatedAt:now};
 order.deliveryFee=extra("deliveryFee");order.serviceFee=extra("serviceFee");order.otherFees=extra("otherFees");order.tip=orderType==="grocery"?extra("tip"):0;order.calculatedSubtotal=order.subtotal;const taxRate=await businessTax(business);if(!taxRate)throw Error("Assign an active tax rate to this business before saving orders.");order.taxRateRef=taxRate._id;order.taxRate=taxRate.rate;order.taxState=taxRate.state?.name||"";order.taxJurisdiction=/nyc|new york city/i.test(taxRate.code||taxRate.name||"")?"NYC":taxRate.state?.abbreviation||taxRate.state?.name||"";order.sourceTax=req.body.sourceTax??req.body.tax??null;order.taxMode=orderType==="grocery"?"itemized":"calculated";order.taxableFees=Object.fromEntries(["shipping","deliveryFee","serviceFee","otherFees"].map(key=>[key,req.body.taxableFees?.[key]===true]));const calculated=orderTotals(order,lines);order.taxableSubtotal=calculated.taxableSubtotal;order.tax=calculated.tax;order.total=calculated.total;order.sourceTotal=req.body.sourceTotal!==""&&req.body.sourceTotal!=null?extra("sourceTotal"):null;order.importedText=String(req.body.importedText||"").slice(0,100000);
 if(req.body.recipe){const recipe=await reference().collection("recipes").findOne({_id:oid(req.body.recipe),business});if(!recipe)throw new Error("Recipe not found.");order.recipeRef=recipe._id;}
 if(req.body.menu){const menu=await reference().collection("menus").findOne({_id:oid(req.body.menu),business});if(!menu)throw new Error("Menu not found.");order.menuRef=menu._id;}
 order.lines=lines.map(line=>({...line,_id:new ObjectId(),business_id:business,purchaseOrderRef:orderId,createdAt:now,updatedAt:now}));order.lineStorage="embedded";order.receiptVersion=0;order.receipts=[];
 if(req.params.id){
  const existing=await local().collection("purchase_orders").findOne({_id:orderId,business_id:business});
  if(!existing||existing.flow!=="ingredients")throw new Error("Order not found.");
  preserveOrderHistory(existing,order,req.body.lines,()=>new ObjectId(),{resetReceiving:req.body.resetReceiving===true});
  if(req.body.receiptDates&&!req.body.resetReceiving){const corrected=correctOrderDates(existing,{orderDate:req.body.orderDate,expectedDate:req.body.expectedDate,receipts:req.body.receiptDates});order.receipts=corrected.receipts;}
  order.orderCorrections=[...(existing.orderCorrections||[]),{at:now,user,before:{orderDate:existing.orderDate,expectedDate:existing.expectedDate,vendorRef:existing.vendorRef,lines:existing.lines,subtotal:existing.subtotal,tax:existing.tax,total:existing.total,shipping:existing.shipping,deliveryFee:existing.deliveryFee,serviceFee:existing.serviceFee,otherFees:existing.otherFees,tip:existing.tip,notes:existing.notes,receipts:existing.receipts,resetReceiving:req.body.resetReceiving===true}}];
  order.poNumber=existing.poNumber;if(!req.body.orderDate)order.orderDate=existing.orderDate;order.createdAt=existing.createdAt;order.createdByRef=existing.createdByRef;
  const result=await local().collection("purchase_orders").replaceOne({_id:orderId,business_id:business,status:existing.status,updatedAt:existing.updatedAt,receiptVersion:existing.receiptVersion===undefined?{$exists:false}:existing.receiptVersion},{...existing,...order});
  if(!result.matchedCount)throw new Error("The order changed. Reload before editing.");
 }else await local().collection("purchase_orders").insertOne(order);
 res.status(req.params.id?200:201).json(order);
});
router.post("/orders",saveDraft);router.put("/orders/:id",saveDraft);
router.patch("/orders/:id/dates",guard(async(req,res,business)=>{const _id=oid(req.params.id),order=await local().collection("purchase_orders").findOne({_id,business_id:business});if(!order||order.flow!=="ingredients")throw Error("Order not found.");const set=correctOrderDates(order,req.body),now=new Date(),user=actor(req);const before={orderDate:order.orderDate,expectedDate:order.expectedDate,receipts:(order.receipts||[]).map(receipt=>({id:receipt._id,deliveryDate:receipt.deliveryDate}))};const result=await local().collection("purchase_orders").updateOne({_id,business_id:business,updatedAt:order.updatedAt},{$set:{...set,updatedAt:now},$push:{dateCorrections:{before,after:{orderDate:set.orderDate,expectedDate:set.expectedDate,receipts:(set.receipts||[]).map(receipt=>({id:receipt._id,deliveryDate:receipt.deliveryDate}))},user,at:now}}});if(!result.matchedCount)throw Error("The order changed. Reload before correcting dates.");res.json({updated:true});}));
router.delete("/orders/:id",guard(async(req,res,business)=>{const _id=oid(req.params.id),order=await local().collection("purchase_orders").findOne({_id,business_id:business});if(!order||order.status!=="cancelled"||order.hasReceipts||order.receipts?.length)throw Error("Only cancelled orders without receiving records can be deleted.");if(await local().collection("goods_receipts").findOne({purchaseOrderRef:_id,business_id:business}))throw Error("Orders with receiving records cannot be deleted.");const result=await local().collection("purchase_orders").deleteOne({_id,business_id:business,status:"cancelled",updatedAt:order.updatedAt});if(!result.deletedCount)throw Error("The order changed. Reload before deleting.");await local().collection("purchase_order_lines").deleteMany({purchaseOrderRef:_id,business_id:business});res.json({deleted:true});}));
router.patch("/orders/:id/status",guard(async(req,res,business)=>{
 const orderId=oid(req.params.id),order=await local().collection("purchase_orders").findOne({_id:orderId,business_id:business});
 if(!order)throw new Error("Order not found.");
 assertOrderTransition(order,req.body.status,{cancelOutstanding:req.body.cancelOutstanding===true});const user=actor(req),now=new Date();
 const set={status:req.body.status,updatedAt:now};
 if(req.body.status==="closed"&&order.status!=="received"){const legacy=order.lines?[]:await local().collection("purchase_order_lines").find({purchaseOrderRef:orderId,business_id:business}).toArray();set.closure={cancelledOutstanding:true,user,at:now,lines:receivedOrderLines(order,legacy).filter(line=>line.orderedQty>line.receivedQty+(line.notFilledQty||0)).map(line=>({line:line._id,packs:line.orderedQty-line.receivedQty-(line.notFilledQty||0)}))};}if(req.body.status==="approved"){set.approvedByRef=user;set.approvedAt=now;}
 const result=await local().collection("purchase_orders").updateOne({_id:orderId,business_id:business,status:order.status,receiptVersion:order.receiptVersion===undefined?{$exists:false}:order.receiptVersion},{$set:set,$push:{statusHistory:{from:order.status,to:req.body.status,user,at:now}}});
 if(!result.matchedCount)throw new Error("The order changed. Reload it before continuing.");
 res.json({...order,...set});
}));
router.post("/orders/:id/receive",guard(async(req,res,business)=>{
 const order=await local().collection("purchase_orders").findOne({_id:oid(req.params.id),business_id:business});if(!order)throw Error("Order not found.");
 const records=await units();const input=[];for(const value of req.body.lines||[]){const clean={line:value.line,accepted:value.accepted,rejected:value.rejected,notFilled:value.notFilled,outcome:value.outcome,replacementName:value.replacementName,replacementPrice:value.replacementPrice,replacementQuantity:value.replacementQuantity,lotNumber:value.lotNumber,expiryDate:value.expiryDate};if(value.offering){const offer=await reference().collection("vendor_ingredient_prices").findOne({_id:oid(value.offering),business,vendor:order.vendorRef,isActive:{$ne:false}});if(!offer)throw Error("Choose an active product from the order vendor.");const ingredient=await reference().collection("ingredients").findOne({_id:offer.ingredient,isActive:{$ne:false}});if(!ingredient)throw Error("Ingredient is unavailable.");const pack=normalizeOffer(offer,records);clean.mappedProduct={ingredientRef:offer.ingredient,vendorIngredientPriceRef:offer._id,packBaseQuantity:pack?.baseQuantity||null,baseUnit:pack?.baseUnit||null};}input.push(clean);}
 const result=await postIngredientReceipt({connection:mongoose.connection,ObjectId,business,orderId:oid(req.params.id),user:actor(req),token:req.body.token,input,invoiceNumber:req.body.invoiceNumber,notes:req.body.notes,deliveryDate:req.body.deliveryDate,onTime:req.body.onTime});
 res.status(201).json(result);
}));
export default router;
