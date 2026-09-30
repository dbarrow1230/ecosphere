import RadioTerm from "../../models/reference/radioTermModel.js";

const getUserId=req=>req.user?._id||req.user?.id||null;
const cleanArray=value=>Array.isArray(value)?value:String(value||"").split(",").map(item=>item.trim()).filter(Boolean);

export const getRadioTerms=async(req,res)=>{
 try{
  const {business,category,search}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};
  if(category&&category!=="all")filter.category=category;

  if(search){
   filter.$or=[
    {term:{$regex:search,$options:"i"}},
    {abbreviation:{$regex:search,$options:"i"}},
    {definition:{$regex:search,$options:"i"}},
    {example:{$regex:search,$options:"i"}},
    {aliases:{$regex:search,$options:"i"}},
    {sourceName:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const records=await RadioTerm.find(filter).sort({term:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getRadioTerm=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await RadioTerm.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Radio term not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createRadioTerm=async(req,res)=>{
 try{
  const record=await RadioTerm.create({
   business:req.body.business,
   term:req.body.term,
   category:req.body.category||"both",
   abbreviation:req.body.abbreviation||"",
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
  if(error.code===11000)return res.status(409).json({message:"This radio term already exists."});
  res.status(400).json({message:error.message});
 }
};

export const updateRadioTerm=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await RadioTerm.findOneAndUpdate({_id:req.params.id,business},{
   term:req.body.term,
   category:req.body.category||"both",
   abbreviation:req.body.abbreviation||"",
   definition:req.body.definition,
   example:req.body.example||"",
   aliases:cleanArray(req.body.aliases),
   sourceName:req.body.sourceName||"",
   sourceUrl:req.body.sourceUrl||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   updatedBy:getUserId(req)
  },{returnDocument:"after",runValidators:true});

  if(!record)return res.status(404).json({message:"Radio term not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This radio term already exists."});
  res.status(400).json({message:error.message});
 }
};

export const deleteRadioTerm=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await RadioTerm.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Radio term not found."});
  if(record.isSystem)return res.status(403).json({message:"System records cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Radio term deleted."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};