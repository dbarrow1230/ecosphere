import {receivedOrderLines,inventoryWithOrderReceipts,orderReceiptHistory} from "../../../../shared/culinary/receivingLedger.js";
import express from "express";
import mongoose from "mongoose";
import businessConnection from "../../db/businessInfoConnection.js";
import {idOf} from "../../../../shared/culinary/pricing.js";
import {assertOrderTransition,makeOrderLines,postIngredientReceipt} from "../../services/purchasing/ingredientWorkflow.js";

const router=express.Router(),ObjectId=mongoose.Types.ObjectId;
const oid=value=>{if(!ObjectId.isValid(idOf(value)))throw new Error("A valid record is required.");return new ObjectId(idOf(value));};
const guard=handler=>async(req,res)=>{
 try{await businessConnection.asPromise();const business=oid(req.query.business||req.body?.business);await handler(req,res,business);}
 catch(error){res.status(error.code===11000?409:400).json({message:error.code===11000?"This order or receipt already exists.":error.message});}
};
const reference=()=>businessConnection.db,local=()=>mongoose.connection.db;
const actor=req=>oid(req.user?._id||req.user?.id||req.body.user);
const units=async()=>[...await reference().collection("imperial_units").find({}).toArray(),...await reference().collection("metric_units").find({}).toArray()];

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
 res.json({vendors,offers,ingredients,locations,records,sourceRecipe,locationTypes});
}));
router.get("/orders",guard(async(req,res,business)=>{
 const query={business_id:business};if(req.query.vendor)query.vendorRef=oid(req.query.vendor);
 const orders=await local().collection("purchase_orders").find(query).sort({createdAt:-1}).limit(100).toArray();
 const lines=await local().collection("purchase_order_lines").find({business_id:business,purchaseOrderRef:{$in:orders.map(order=>order._id)}}).sort({lineNumber:1}).toArray();
 res.json(orders.map(order=>({...order,lines:receivedOrderLines(order,lines.filter(line=>idOf(line.purchaseOrderRef)===idOf(order)))})));
}));
router.get("/receipts",guard(async(req,res,business)=>{res.json(await orderReceiptHistory(local(),business,req.query.vendor?oid(req.query.vendor):null));}));
router.get("/inventory",guard(async(req,res,business)=>{res.json(await inventoryWithOrderReceipts(local(),business));}));
const saveDraft=guard(async(req,res,business)=>{
 const vendor=oid(req.body.vendor),location=oid(req.body.location),user=actor(req);
 const [vendorRecord,locationRecord,offers,ingredients,records]=await Promise.all([
  reference().collection("vendors").findOne({_id:vendor,isActive:{$ne:false}}),reference().collection("locations").findOne({_id:location,business,isActive:{$ne:false}}),reference().collection("vendor_ingredient_prices").find({vendor,business,isActive:{$ne:false}}).toArray(),reference().collection("ingredients").find({$or:[{business},{business:null},{business:{$exists:false}}]}).toArray(),units()
 ]);
 if(!vendorRecord||!locationRecord)throw new Error("Choose an active vendor and business location.");
 const lines=makeOrderLines(req.body.lines,offers,ingredients,records,business,vendor),orderId=req.params.id?oid(req.params.id):new ObjectId(),now=new Date();
 const extra=name=>{const value=Number(req.body[name]||0);if(!Number.isFinite(value)||value<0)throw new Error(`Enter a valid ${name}.`);return value;};
 const expectedDate=req.body.expectedDate?new Date(req.body.expectedDate):null;
 if(expectedDate&&Number.isNaN(expectedDate.getTime()))throw new Error("Enter a valid expected date.");
 const order={_id:orderId,business_id:business,vendorRef:vendor,locationRef:location,poNumber:`PO-${now.toISOString().slice(0,10).replaceAll("-","")}-${idOf(orderId).slice(-6).toUpperCase()}`,status:"draft",flow:"ingredients",orderDate:now,expectedDate,currency:vendorRecord.payment?.currencyCode||"USD",subtotal:lines.reduce((sum,line)=>sum+line.lineTotal,0),shipping:extra("shipping"),tax:extra("tax"),createdByRef:user,notes:String(req.body.notes||"").trim(),createdAt:now,updatedAt:now};
 order.total=order.subtotal+order.shipping+order.tax;
 if(req.body.recipe){const recipe=await reference().collection("recipes").findOne({_id:oid(req.body.recipe),business});if(!recipe)throw new Error("Recipe not found.");order.recipeRef=recipe._id;}
 if(req.body.menu){const menu=await reference().collection("menus").findOne({_id:oid(req.body.menu),business});if(!menu)throw new Error("Menu not found.");order.menuRef=menu._id;}
 order.lines=lines.map(line=>({...line,_id:new ObjectId(),business_id:business,purchaseOrderRef:orderId,createdAt:now,updatedAt:now}));order.lineStorage="embedded";order.receiptVersion=0;order.receipts=[];
 if(req.params.id){
  const existing=await local().collection("purchase_orders").findOne({_id:orderId,business_id:business});
  if(!existing||existing.status!=="draft"||existing.flow!=="ingredients")throw new Error("Only draft ingredient orders can be edited.");
  order.poNumber=existing.poNumber;order.orderDate=existing.orderDate;order.createdAt=existing.createdAt;order.createdByRef=existing.createdByRef;
  const result=await local().collection("purchase_orders").replaceOne({_id:orderId,business_id:business,status:"draft",receiptVersion:existing.receiptVersion===undefined?{$exists:false}:existing.receiptVersion},{...existing,...order});
  if(!result.matchedCount)throw new Error("The order changed. Reload before editing.");
 }else await local().collection("purchase_orders").insertOne(order);
 res.status(req.params.id?200:201).json(order);
});
router.post("/orders",saveDraft);router.put("/orders/:id",saveDraft);
router.patch("/orders/:id/status",guard(async(req,res,business)=>{
 const orderId=oid(req.params.id),order=await local().collection("purchase_orders").findOne({_id:orderId,business_id:business});
 if(!order)throw new Error("Order not found.");
 assertOrderTransition(order,req.body.status,{cancelOutstanding:req.body.cancelOutstanding===true});const user=actor(req),now=new Date();
 const set={status:req.body.status,updatedAt:now};
 if(req.body.status==="closed"&&order.status!=="received"){const legacy=order.lines?[]:await local().collection("purchase_order_lines").find({purchaseOrderRef:orderId,business_id:business}).toArray();set.closure={cancelledOutstanding:true,user,at:now,lines:receivedOrderLines(order,legacy).filter(line=>line.orderedQty>line.receivedQty).map(line=>({line:line._id,packs:line.orderedQty-line.receivedQty}))};}if(req.body.status==="approved"){set.approvedByRef=user;set.approvedAt=now;}
 const result=await local().collection("purchase_orders").updateOne({_id:orderId,business_id:business,status:order.status,receiptVersion:order.receiptVersion===undefined?{$exists:false}:order.receiptVersion},{$set:set,$push:{statusHistory:{from:order.status,to:req.body.status,user,at:now}}});
 if(!result.matchedCount)throw new Error("The order changed. Reload it before continuing.");
 res.json({...order,...set});
}));
router.post("/orders/:id/receive",guard(async(req,res,business)=>{
 const result=await postIngredientReceipt({connection:mongoose.connection,ObjectId,business,orderId:oid(req.params.id),user:actor(req),token:req.body.token,input:req.body.lines,invoiceNumber:req.body.invoiceNumber,notes:req.body.notes});
 res.status(201).json(result);
}));
export default router;
