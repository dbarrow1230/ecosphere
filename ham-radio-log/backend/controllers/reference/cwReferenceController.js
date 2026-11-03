import CwReference from "../../models/reference/cwReferenceModel.js";

const getUserId=req=>req.user?._id||req.user?.id||null;
const cleanArray=value=>Array.isArray(value)?value:String(value||"").split(",").map(item=>item.trim()).filter(Boolean);

export const getCwReferences=async(req,res)=>{
 try{
  const {business,category,search}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};
  if(category&&category!=="all")filter.category=category;

  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {code:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {definition:{$regex:search,$options:"i"}},
    {example:{$regex:search,$options:"i"}},
    {aliases:{$regex:search,$options:"i"}}
   ];
  }

  const records=await CwReference.find(filter).sort({category:1,title:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getCwReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await CwReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"CW reference not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createCwReference=async(req,res)=>{
 try{
  const record=await CwReference.create({
   business:req.body.business,
   title:req.body.title,
   code:req.body.code,
   category:req.body.category,
   summary:req.body.summary||"",
   definition:req.body.definition,
   example:req.body.example||"",
   aliases:cleanArray(req.body.aliases),
   sourceName:req.body.sourceName||"",
   sourceUrl:req.body.sourceUrl||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   isSystem:req.body.isSystem===true,
   createdBy:getUserId(req),
   updatedBy:getUserId(req)
  });

  res.status(201).json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This CW reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const updateCwReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await CwReference.findOneAndUpdate({_id:req.params.id,business},{
   title:req.body.title,
   code:req.body.code,
   category:req.body.category,
   summary:req.body.summary||"",
   definition:req.body.definition,
   example:req.body.example||"",
   aliases:cleanArray(req.body.aliases),
   sourceName:req.body.sourceName||"",
   sourceUrl:req.body.sourceUrl||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   updatedBy:getUserId(req)
  },{returnDocument:"after",runValidators:true});

  if(!record)return res.status(404).json({message:"CW reference not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This CW reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const deleteCwReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await CwReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"CW reference not found."});
  if(record.isSystem)return res.status(403).json({message:"System records cannot be deleted."});

  await record.deleteOne();
  res.json({message:"CW reference deleted."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};