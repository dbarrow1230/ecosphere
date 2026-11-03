// backend/controllers/clients/clientsController.js
import Client from "../../models/clients/clientsModel.js";
import Country from "../../models/locations/countryModel.js";
import State from "../../models/locations/stateModel.js";

const normalizeStatus=value=>{
 const status=String(value||"").trim().toLowerCase();
 return status==="inactive"?"inactive":"active";
};

const buildClientPayload=body=>({
 name:body.name?.trim()||"",
 firstName:body.firstName?.trim()||"",
 lastName:body.lastName?.trim()||"",
 company:body.company?.trim()||"",
 email:body.email?.trim()?.toLowerCase()||"",
 phone:body.phone?.trim()||"",
 altPhone:body.altPhone?.trim()||"",
 address1:body.address1?.trim()||"",
 address2:body.address2?.trim()||"",
 city:body.city?.trim()||"",
 state:body.state||null,
 country:body.country||null,
 postalCode:body.postalCode?.trim()||"",
 notes:body.notes?.trim()||"",
 status:normalizeStatus(body.status)
});

const clientPopulateOptions=[
 {path:"country",model:Country,select:"name iso2 iso3 flag phoneCode currency timezone utcOffset"},
 {path:"state",model:State,select:"name"}
];

export const getClients=async(req,res)=>{
 try{
  const clients=await Client.find()
   .populate(clientPopulateOptions)
   .sort({createdAt:-1});

  res.status(200).json({success:true,count:clients.length,clients});
 }catch(err){
  console.error("Error fetching clients:",err);
  res.status(500).json({success:false,message:"Failed to fetch clients.",error:err.message});
 }
};

export const getClientById=async(req,res)=>{
 try{
  const client=await Client.findById(req.params.id)
   .populate(clientPopulateOptions);

  if(!client){
   return res.status(404).json({success:false,message:"Client not found."});
  }

  res.status(200).json({success:true,client});
 }catch(err){
  console.error("Error fetching client:",err);
  res.status(500).json({success:false,message:"Failed to fetch client.",error:err.message});
 }
};

export const createClient=async(req,res)=>{
 try{
  const payload=buildClientPayload(req.body);

  if(!payload.name||!payload.firstName||!payload.lastName||!payload.email||!payload.phone){
   return res.status(400).json({success:false,message:"Name, first name, last name, email, and phone are required."});
  }

  const existingClient=await Client.findOne({email:payload.email});
  if(existingClient){
   return res.status(409).json({success:false,message:"A client with this email already exists."});
  }

  const client=await Client.create(payload);
  const savedClient=await Client.findById(client._id)
   .populate(clientPopulateOptions);

  res.status(201).json({success:true,message:"Client created successfully.",client:savedClient});
 }catch(err){
  console.error("Error creating client:",err);
  res.status(500).json({success:false,message:"Failed to create client.",error:err.message});
 }
};

export const updateClient=async(req,res)=>{
 try{
  const payload=buildClientPayload(req.body);

  if(!payload.name||!payload.firstName||!payload.lastName||!payload.email||!payload.phone){
   return res.status(400).json({success:false,message:"Name, first name, last name, email, and phone are required."});
  }

  const existingClient=await Client.findOne({email:payload.email,_id:{$ne:req.params.id}});
  if(existingClient){
   return res.status(409).json({success:false,message:"A client with this email already exists."});
  }

  const client=await Client.findByIdAndUpdate(
   req.params.id,
   payload,
   {returnDocument:"after",runValidators:true}
  ).populate(clientPopulateOptions);

  if(!client){
   return res.status(404).json({success:false,message:"Client not found."});
  }

  res.status(200).json({success:true,message:"Client updated successfully.",client});
 }catch(err){
  console.error("Error updating client:",err);
  res.status(500).json({success:false,message:"Failed to update client.",error:err.message});
 }
};

export const deleteClient=async(req,res)=>{
 try{
  const client=await Client.findByIdAndDelete(req.params.id);

  if(!client){
   return res.status(404).json({success:false,message:"Client not found."});
  }

  res.status(200).json({success:true,message:"Client deleted successfully."});
 }catch(err){
  console.error("Error deleting client:",err);
  res.status(500).json({success:false,message:"Failed to delete client.",error:err.message});
 }
};
