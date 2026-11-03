import PhoneticAlphabetReference from "../../models/reference/phoneticAlphabetReferenceModel.js";

const getUserId=req=>req.user?._id||req.user?.id||null;

export const getPhoneticAlphabetReferences=async(req,res)=>{
 try{
  const {business,category,search}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};
  if(category&&category!=="all")filter.category=category;

  if(search){
   filter.$or=[
    {symbol:{$regex:search,$options:"i"}},
    {word:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {pronunciation:{$regex:search,$options:"i"}},
    {definition:{$regex:search,$options:"i"}},
    {example:{$regex:search,$options:"i"}},
    {sourceName:{$regex:search,$options:"i"}},
    {notes:{$regex:search,$options:"i"}}
   ];
  }

  const records=await PhoneticAlphabetReference.find(filter).sort({category:1,symbol:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getPhoneticAlphabetReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await PhoneticAlphabetReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Phonetic alphabet reference not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createPhoneticAlphabetReference=async(req,res)=>{
 try{
  const record=await PhoneticAlphabetReference.create({
   business:req.body.business,
   symbol:req.body.symbol,
   word:req.body.word,
   category:req.body.category,
   pronunciation:req.body.pronunciation||"",
   definition:req.body.definition||"",
   example:req.body.example||"",
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
  if(error.code===11000)return res.status(409).json({message:"This phonetic alphabet reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const updatePhoneticAlphabetReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await PhoneticAlphabetReference.findOneAndUpdate({_id:req.params.id,business},{
   symbol:req.body.symbol,
   word:req.body.word,
   category:req.body.category,
   pronunciation:req.body.pronunciation||"",
   definition:req.body.definition||"",
   example:req.body.example||"",
   sourceName:req.body.sourceName||"",
   sourceUrl:req.body.sourceUrl||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   updatedBy:getUserId(req)
  },{returnDocument:"after",runValidators:true});

  if(!record)return res.status(404).json({message:"Phonetic alphabet reference not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This phonetic alphabet reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const deletePhoneticAlphabetReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await PhoneticAlphabetReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Phonetic alphabet reference not found."});
  if(record.isSystem)return res.status(403).json({message:"System records cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Phonetic alphabet reference deleted."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};