// backend/controllers/orders/purchaseOrderController.js
import PurchaseOrder from "../../models/orders/PurchaseOrderModel.js";

export const createPurchaseOrder=async(req,res)=>{
 try{
  const {
   orderNumber,vendor,vendorSnapshot,items,status,orderedAt,expectedAt,receivedAt,cancelledAt,closedAt,
   subtotal,tax,shippingCost,discount,total,currency,paymentStatus,notes,internalNotes,createdBy,approvedBy,isActive
  }=req.body;

  if(!orderNumber||!orderNumber.trim()) return res.status(400).json({message:"Order number is required"});
  if(!vendor) return res.status(400).json({message:"Vendor is required"});
  if(!vendorSnapshot) return res.status(400).json({message:"Vendor snapshot is required"});
  if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Purchase order must have items"});

  const purchaseOrder=await PurchaseOrder.create({
   orderNumber:orderNumber.trim(),
   vendor,
   vendorSnapshot,
   items,
   status:status||"draft",
   orderedAt:orderedAt||null,
   expectedAt:expectedAt||null,
   receivedAt:receivedAt||null,
   cancelledAt:cancelledAt||null,
   closedAt:closedAt||null,
   subtotal:subtotal||0,
   tax:tax||0,
   shippingCost:shippingCost||0,
   discount:discount||0,
   total:total||0,
   currency:currency||"USD",
   paymentStatus:paymentStatus||"unpaid",
   notes:notes?.trim()||"",
   internalNotes:internalNotes?.trim()||"",
   statusHistory:[{status:status||"draft"}],
   createdBy:createdBy||null,
   approvedBy:approvedBy||null,
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(purchaseOrder);
 }catch(error){
  return res.status(500).json({message:"Failed to create purchase order",error:error.message});
 }
};

export const getPurchaseOrders=async(req,res)=>{
 try{
  const {status,paymentStatus,vendor,isActive}=req.query;

  const filter={};

  if(status) filter.status=status;
  if(paymentStatus) filter.paymentStatus=paymentStatus;
  if(vendor) filter.vendor=vendor;
  if(isActive==="true") filter.isActive=true;
  if(isActive==="false") filter.isActive=false;

  const purchaseOrders=await PurchaseOrder.find(filter)
   .populate("vendor")
   .populate("createdBy")
   .populate("approvedBy")
   .sort({createdAt:-1});

  return res.status(200).json(purchaseOrders);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch purchase orders",error:error.message});
 }
};

export const getPurchaseOrderById=async(req,res)=>{
 try{
  const purchaseOrder=await PurchaseOrder.findById(req.params.id)
   .populate("vendor")
   .populate("createdBy")
   .populate("approvedBy");

  if(!purchaseOrder) return res.status(404).json({message:"Purchase order not found"});

  return res.status(200).json(purchaseOrder);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch purchase order",error:error.message});
 }
};

export const updatePurchaseOrder=async(req,res)=>{
 try{
  const {
   vendor,vendorSnapshot,items,status,orderedAt,expectedAt,receivedAt,cancelledAt,closedAt,
   subtotal,tax,shippingCost,discount,total,currency,paymentStatus,notes,internalNotes,createdBy,approvedBy,isActive
  }=req.body;

  const updateData={};

  if(vendor!==undefined) updateData.vendor=vendor;
  if(vendorSnapshot!==undefined) updateData.vendorSnapshot=vendorSnapshot;

  if(items!==undefined){
   if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Purchase order must have items"});
   updateData.items=items;
  }

  if(orderedAt!==undefined) updateData.orderedAt=orderedAt||null;
  if(expectedAt!==undefined) updateData.expectedAt=expectedAt||null;
  if(receivedAt!==undefined) updateData.receivedAt=receivedAt||null;
  if(cancelledAt!==undefined) updateData.cancelledAt=cancelledAt||null;
  if(closedAt!==undefined) updateData.closedAt=closedAt||null;

  if(subtotal!==undefined) updateData.subtotal=subtotal;
  if(tax!==undefined) updateData.tax=tax;
  if(shippingCost!==undefined) updateData.shippingCost=shippingCost;
  if(discount!==undefined) updateData.discount=discount;
  if(total!==undefined) updateData.total=total;
  if(currency!==undefined) updateData.currency=currency;

  if(paymentStatus!==undefined) updateData.paymentStatus=paymentStatus;

  if(notes!==undefined) updateData.notes=notes?.trim()||"";
  if(internalNotes!==undefined) updateData.internalNotes=internalNotes?.trim()||"";

  if(createdBy!==undefined) updateData.createdBy=createdBy||null;
  if(approvedBy!==undefined) updateData.approvedBy=approvedBy||null;
  if(isActive!==undefined) updateData.isActive=isActive;

  if(status!==undefined){
   updateData.status=status;
   updateData.$push={statusHistory:{status}};
   if(status==="ordered"&&orderedAt===undefined) updateData.orderedAt=new Date();
   if(status==="received"&&receivedAt===undefined) updateData.receivedAt=new Date();
   if(status==="cancelled"&&cancelledAt===undefined) updateData.cancelledAt=new Date();
   if(status==="closed"&&closedAt===undefined) updateData.closedAt=new Date();
  }

  const purchaseOrder=await PurchaseOrder.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("vendor")
   .populate("createdBy")
   .populate("approvedBy");

  if(!purchaseOrder) return res.status(404).json({message:"Purchase order not found"});

  return res.status(200).json(purchaseOrder);
 }catch(error){
  return res.status(500).json({message:"Failed to update purchase order",error:error.message});
 }
};

export const deletePurchaseOrder=async(req,res)=>{
 try{
  const purchaseOrder=await PurchaseOrder.findByIdAndDelete(req.params.id);

  if(!purchaseOrder) return res.status(404).json({message:"Purchase order not found"});

  return res.status(200).json({message:"Purchase order deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete purchase order",error:error.message});
 }
};