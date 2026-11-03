import Customer from "../../models/orders/customerModel.js";

const populateCustomer=query=>query
 .populate("state")
 .populate("country")
 .populate("address.state")
 .populate("address.country");

const normalizeCustomerPayload=body=>({
 ...body,
 name:String(body?.name||`${body?.firstName||""} ${body?.lastName||""}`.trim()||body?.company||body?.email||"").trim(),
 firstName:String(body?.firstName||"").trim(),
 lastName:String(body?.lastName||"").trim(),
 company:String(body?.company||"").trim(),
 email:String(body?.email||body?.contact?.email||"").trim(),
 phone:String(body?.phone||body?.contact?.phone||"").trim(),
 altPhone:String(body?.altPhone||"").trim(),
 address1:String(body?.address1||body?.address?.street||"").trim(),
 address2:String(body?.address2||"").trim(),
 city:String(body?.city||body?.address?.city||"").trim(),
 state:body?.state||body?.address?.state||null,
 country:body?.country||body?.address?.country||null,
 postalCode:String(body?.postalCode||body?.address?.zip||"").trim(),
 status:String(body?.status||"active").trim().toLowerCase()==="inactive"?"inactive":"active",
 isActive:String(body?.status||"active").trim().toLowerCase()!=="inactive",
 contact:{
  contactName:String(body?.contact?.contactName||body?.name||"").trim(),
  email:String(body?.email||body?.contact?.email||"").trim(),
  phone:String(body?.phone||body?.contact?.phone||"").trim()
 },
 address:{
  street:String(body?.address1||body?.address?.street||"").trim(),
  city:String(body?.city||body?.address?.city||"").trim(),
  state:body?.state||body?.address?.state||null,
  country:body?.country||body?.address?.country||null,
  zip:String(body?.postalCode||body?.address?.zip||"").trim()
 },
 notes:String(body?.notes||"").trim()
});

export const getCustomers=async(req,res)=>{
 try{
  const q={};
  if(req.query.isActive!==undefined)q.isActive=req.query.isActive==="true";
  if(req.query.search){
   q.$or=[
    {name:{$regex:req.query.search,$options:"i"}},
    {"contact.email":{$regex:req.query.search,$options:"i"}},
    {"contact.phone":{$regex:req.query.search,$options:"i"}},
    {notes:{$regex:req.query.search,$options:"i"}}
   ];
  }
  const customers=await populateCustomer(Customer.find(q)).sort({name:1});
  return res.status(200).json({success:true,count:customers.length,data:customers,customers});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch customers"});
 }
};

export const getCustomerById=async(req,res)=>{
 try{
  const customer=await populateCustomer(Customer.findById(req.params.id));
  if(!customer)return res.status(404).json({success:false,message:"Customer not found"});
  return res.status(200).json({success:true,data:customer,customer});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to fetch customer"});
 }
};

export const createCustomer=async(req,res)=>{
 try{
  const customer=await Customer.create(normalizeCustomerPayload(req.body));
  const populated=await populateCustomer(Customer.findById(customer._id));
  return res.status(201).json({success:true,message:"Customer created",data:populated,customer:populated});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to create customer"});
 }
};

export const updateCustomer=async(req,res)=>{
 try{
  const customer=await populateCustomer(Customer.findByIdAndUpdate(req.params.id,normalizeCustomerPayload(req.body),{returnDocument:"after",runValidators:true}));
  if(!customer)return res.status(404).json({success:false,message:"Customer not found"});
  return res.status(200).json({success:true,message:"Customer updated",data:customer,customer});
 }catch(error){
  return res.status(400).json({success:false,message:error.message||"Failed to update customer"});
 }
};

export const deleteCustomer=async(req,res)=>{
 try{
  const customer=await Customer.findByIdAndDelete(req.params.id);
  if(!customer)return res.status(404).json({success:false,message:"Customer not found"});
  return res.status(200).json({success:true,message:"Customer deleted"});
 }catch(error){
  return res.status(500).json({success:false,message:error.message||"Failed to delete customer"});
 }
};

