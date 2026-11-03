import ReferenceOrganization from "../../models/reference/referenceOrganizationModel.js";

const getUserId=req=>req.user?._id||req.user?.id||null;

export const getReferenceOrganizations=async(req,res)=>{
 try{
  const {business,category,search}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};
  if(category&&category!=="all")filter.category=category;

  if(search){
   filter.$or=[
    {name:{$regex:search,$options:"i"}},
    {role:{$regex:search,$options:"i"}},
    {url:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {jurisdiction:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const records=await ReferenceOrganization.find(filter).sort({name:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getReferenceOrganization=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await ReferenceOrganization.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Reference organization not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createReferenceOrganization=async(req,res)=>{
 try{
  const record=await ReferenceOrganization.create({
   business:req.body.business,
   name:req.body.name,
   role:req.body.role,
   url:req.body.url||"",
   category:req.body.category||"General",
   jurisdiction:req.body.jurisdiction||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   createdBy:getUserId(req),
   updatedBy:getUserId(req)
  });

  res.status(201).json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This reference organization already exists."});
  res.status(400).json({message:error.message});
 }
};

export const updateReferenceOrganization=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await ReferenceOrganization.findOneAndUpdate({_id:req.params.id,business},{
   name:req.body.name,
   role:req.body.role,
   url:req.body.url||"",
   category:req.body.category||"General",
   jurisdiction:req.body.jurisdiction||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   updatedBy:getUserId(req)
  },{returnDocument:"after",runValidators:true});

  if(!record)return res.status(404).json({message:"Reference organization not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This reference organization already exists."});
  res.status(400).json({message:error.message});
 }
};

export const deleteReferenceOrganization=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await ReferenceOrganization.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Reference organization not found."});
  if(record.isSystem)return res.status(403).json({message:"System records cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Reference organization deleted."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};