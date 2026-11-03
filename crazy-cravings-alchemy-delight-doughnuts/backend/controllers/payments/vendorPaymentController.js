// backend/controllers/payments/vendorPaymentController.js
import VendorPayment from "../../models/payments/VendorPaymentModel.js";

export const createVendorPayment=async(req,res)=>{
 try{
  const {
   purchaseOrder,vendor,method,provider,reference,amount,currency,status,
   paidAt,failedAt,cancelledAt,notes,metadata,createdBy,isActive
  }=req.body;

  if(!purchaseOrder) return res.status(400).json({message:"Purchase order is required"});
  if(!vendor) return res.status(400).json({message:"Vendor is required"});
  if(!method) return res.status(400).json({message:"Payment method is required"});
  if(amount===undefined||amount<0) return res.status(400).json({message:"Amount is required"});

  const vendorPayment=await VendorPayment.create({
   purchaseOrder,
   vendor,
   method,
   provider:provider?.trim()||"",
   reference:reference?.trim()||"",
   amount,
   currency:currency||"USD",
   status:status||"pending",
   paidAt:paidAt||null,
   failedAt:failedAt||null,
   cancelledAt:cancelledAt||null,
   refunds:[],
   events:[{type:"created",status:status||"pending",amount}],
   notes:notes?.trim()||"",
   metadata:metadata||{},
   createdBy:createdBy||null,
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(vendorPayment);
 }catch(error){
  return res.status(500).json({message:"Failed to create vendor payment",error:error.message});
 }
};

export const getVendorPayments=async(req,res)=>{
 try{
  const {status,method,vendor,purchaseOrder}=req.query;

  const filter={};

  if(status) filter.status=status;
  if(method) filter.method=method;
  if(vendor) filter.vendor=vendor;
  if(purchaseOrder) filter.purchaseOrder=purchaseOrder;

  const vendorPayments=await VendorPayment.find(filter)
   .populate("vendor")
   .populate("purchaseOrder")
   .populate("createdBy")
   .sort({createdAt:-1});

  return res.status(200).json(vendorPayments);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor payments",error:error.message});
 }
};

export const getVendorPaymentById=async(req,res)=>{
 try{
  const vendorPayment=await VendorPayment.findById(req.params.id)
   .populate("vendor")
   .populate("purchaseOrder")
   .populate("createdBy");

  if(!vendorPayment) return res.status(404).json({message:"Vendor payment not found"});

  return res.status(200).json(vendorPayment);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch vendor payment",error:error.message});
 }
};

export const updateVendorPayment=async(req,res)=>{
 try{
  const {
   method,provider,reference,amount,currency,status,
   paidAt,failedAt,cancelledAt,notes,metadata,createdBy,isActive
  }=req.body;

  const updateData={};

  if(method!==undefined) updateData.method=method;
  if(provider!==undefined) updateData.provider=provider?.trim()||"";
  if(reference!==undefined) updateData.reference=reference?.trim()||"";

  if(amount!==undefined){
   if(amount<0) return res.status(400).json({message:"Amount must be >= 0"});
   updateData.amount=amount;
  }

  if(currency!==undefined) updateData.currency=currency;

  if(notes!==undefined) updateData.notes=notes?.trim()||"";
  if(metadata!==undefined) updateData.metadata=metadata;
  if(createdBy!==undefined) updateData.createdBy=createdBy||null;
  if(isActive!==undefined) updateData.isActive=isActive;

  if(status!==undefined){
   updateData.status=status;
   updateData.$push={events:{type:"status_change",status,amount:amount||0}};
   if(status==="paid"&&paidAt===undefined) updateData.paidAt=new Date();
   if(status==="failed"&&failedAt===undefined) updateData.failedAt=new Date();
   if(status==="cancelled"&&cancelledAt===undefined) updateData.cancelledAt=new Date();
  }

  const vendorPayment=await VendorPayment.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("vendor")
   .populate("purchaseOrder")
   .populate("createdBy");

  if(!vendorPayment) return res.status(404).json({message:"Vendor payment not found"});

  return res.status(200).json(vendorPayment);
 }catch(error){
  return res.status(500).json({message:"Failed to update vendor payment",error:error.message});
 }
};

export const deleteVendorPayment=async(req,res)=>{
 try{
  const vendorPayment=await VendorPayment.findByIdAndDelete(req.params.id);

  if(!vendorPayment) return res.status(404).json({message:"Vendor payment not found"});

  return res.status(200).json({message:"Vendor payment deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete vendor payment",error:error.message});
 }
};