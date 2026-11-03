// backend/controllers/payments/paymentController.js
import Payment from "../../models/payments/PaymentModel.js";

export const createPayment=async(req,res)=>{
 try{
  const {
   order,customer,method,provider,reference,amount,currency,status,
   paidAt,failedAt,cancelledAt,notes,metadata,isActive
  }=req.body;

  if(!order) return res.status(400).json({message:"Order is required"});
  if(!customer) return res.status(400).json({message:"Customer is required"});
  if(!method) return res.status(400).json({message:"Payment method is required"});
  if(amount===undefined||amount<0) return res.status(400).json({message:"Amount is required"});

  const payment=await Payment.create({
   order,
   customer,
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
   isActive:typeof isActive==="boolean"?isActive:true
  });

  return res.status(201).json(payment);
 }catch(error){
  return res.status(500).json({message:"Failed to create payment",error:error.message});
 }
};

export const getPayments=async(req,res)=>{
 try{
  const {status,method,customer,order}=req.query;

  const filter={};

  if(status) filter.status=status;
  if(method) filter.method=method;
  if(customer) filter.customer=customer;
  if(order) filter.order=order;

  const payments=await Payment.find(filter)
   .populate("order")
   .populate("customer")
   .sort({createdAt:-1});

  return res.status(200).json(payments);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch payments",error:error.message});
 }
};

export const getPaymentById=async(req,res)=>{
 try{
  const payment=await Payment.findById(req.params.id)
   .populate("order")
   .populate("customer");

  if(!payment) return res.status(404).json({message:"Payment not found"});

  return res.status(200).json(payment);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch payment",error:error.message});
 }
};

export const updatePayment=async(req,res)=>{
 try{
  const {
   method,provider,reference,amount,currency,status,
   paidAt,failedAt,cancelledAt,notes,metadata,isActive
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
  if(isActive!==undefined) updateData.isActive=isActive;

  if(status!==undefined){
   updateData.status=status;
   updateData.$push={events:{type:"status_change",status,amount:amount||0}};
   if(status==="paid"&&paidAt===undefined) updateData.paidAt=new Date();
   if(status==="failed"&&failedAt===undefined) updateData.failedAt=new Date();
   if(status==="cancelled"&&cancelledAt===undefined) updateData.cancelledAt=new Date();
  }

  const payment=await Payment.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("order")
   .populate("customer");

  if(!payment) return res.status(404).json({message:"Payment not found"});

  return res.status(200).json(payment);
 }catch(error){
  return res.status(500).json({message:"Failed to update payment",error:error.message});
 }
};

export const deletePayment=async(req,res)=>{
 try{
  const payment=await Payment.findByIdAndDelete(req.params.id);

  if(!payment) return res.status(404).json({message:"Payment not found"});

  return res.status(200).json({message:"Payment deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete payment",error:error.message});
 }
};