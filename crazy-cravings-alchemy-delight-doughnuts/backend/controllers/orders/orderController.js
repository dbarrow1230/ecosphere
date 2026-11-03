// backend/controllers/orders/orderController.js
import Order from "../../models/orders/OrderModel.js";

export const createOrder=async(req,res)=>{
 try{
  const {
   orderNumber,customer,items,status,fulfillmentType,deliveryAddress,scheduledFor,
   subtotal,tax,discount,deliveryFee,tip,total,currency,paymentStatus,
   customerNotes,internalNotes
  }=req.body;

  if(!orderNumber||!orderNumber.trim()) return res.status(400).json({message:"Order number is required"});
  if(!customer) return res.status(400).json({message:"Customer is required"});
  if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Order must have items"});
  if(!fulfillmentType) return res.status(400).json({message:"Fulfillment type is required"});

  const order=await Order.create({
   orderNumber:orderNumber.trim(),
   customer,
   items,
   status:status||"pending",
   fulfillmentType,
   deliveryAddress:deliveryAddress||null,
   scheduledFor:scheduledFor||null,
   subtotal:subtotal||0,
   tax:tax||0,
   discount:discount||0,
   deliveryFee:deliveryFee||0,
   tip:tip||0,
   total:total||0,
   currency:currency||"USD",
   paymentStatus:paymentStatus||"unpaid",
   customerNotes:customerNotes?.trim()||"",
   internalNotes:internalNotes?.trim()||"",
   statusHistory:[{status:status||"pending"}]
  });

  return res.status(201).json(order);
 }catch(error){
  return res.status(500).json({message:"Failed to create order",error:error.message});
 }
};

export const getOrders=async(req,res)=>{
 try{
  const {status,paymentStatus,customer}=req.query;

  const filter={};

  if(status) filter.status=status;
  if(paymentStatus) filter.paymentStatus=paymentStatus;
  if(customer) filter.customer=customer;

  const orders=await Order.find(filter)
   .populate("customer")
   .populate("items.menuItem")
   .sort({placedAt:-1});

  return res.status(200).json(orders);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch orders",error:error.message});
 }
};

export const getOrderById=async(req,res)=>{
 try{
  const order=await Order.findById(req.params.id)
   .populate("customer")
   .populate("items.menuItem");

  if(!order) return res.status(404).json({message:"Order not found"});

  return res.status(200).json(order);
 }catch(error){
  return res.status(500).json({message:"Failed to fetch order",error:error.message});
 }
};

export const updateOrder=async(req,res)=>{
 try{
  const {
   items,status,fulfillmentType,deliveryAddress,scheduledFor,
   subtotal,tax,discount,deliveryFee,tip,total,currency,paymentStatus,
   customerNotes,internalNotes
  }=req.body;

  const updateData={};

  if(items!==undefined){
   if(!Array.isArray(items)||items.length===0) return res.status(400).json({message:"Order must have items"});
   updateData.items=items;
  }

  if(fulfillmentType!==undefined) updateData.fulfillmentType=fulfillmentType;
  if(deliveryAddress!==undefined) updateData.deliveryAddress=deliveryAddress||null;
  if(scheduledFor!==undefined) updateData.scheduledFor=scheduledFor||null;

  if(subtotal!==undefined) updateData.subtotal=subtotal;
  if(tax!==undefined) updateData.tax=tax;
  if(discount!==undefined) updateData.discount=discount;
  if(deliveryFee!==undefined) updateData.deliveryFee=deliveryFee;
  if(tip!==undefined) updateData.tip=tip;
  if(total!==undefined) updateData.total=total;
  if(currency!==undefined) updateData.currency=currency;

  if(paymentStatus!==undefined) updateData.paymentStatus=paymentStatus;

  if(customerNotes!==undefined) updateData.customerNotes=customerNotes?.trim()||"";
  if(internalNotes!==undefined) updateData.internalNotes=internalNotes?.trim()||"";

  if(status!==undefined){
   updateData.status=status;
   updateData.$push={statusHistory:{status}};
   if(status==="completed") updateData.completedAt=new Date();
   if(status==="cancelled") updateData.cancelledAt=new Date();
  }

  const order=await Order.findByIdAndUpdate(
   req.params.id,
   updateData,
   {returnDocument:"after",runValidators:true}
  )
   .populate("customer")
   .populate("items.menuItem");

  if(!order) return res.status(404).json({message:"Order not found"});

  return res.status(200).json(order);
 }catch(error){
  return res.status(500).json({message:"Failed to update order",error:error.message});
 }
};

export const deleteOrder=async(req,res)=>{
 try{
  const order=await Order.findByIdAndDelete(req.params.id);

  if(!order) return res.status(404).json({message:"Order not found"});

  return res.status(200).json({message:"Order deleted successfully"});
 }catch(error){
  return res.status(500).json({message:"Failed to delete order",error:error.message});
 }
};