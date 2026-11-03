import TechnicalReference from "../../models/reference/technicalReferenceModel.js";

const getUserId=req=>req.user?._id||req.user?.id||null;
const cleanArray=value=>Array.isArray(value)?value:String(value||"").split(",").map(item=>item.trim()).filter(Boolean);

export const getTechnicalReferences=async(req,res)=>{
 try{
  const {business,category,search}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const filter={business};
  if(category&&category!=="all")filter.category=category;

  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {category:{$regex:search,$options:"i"}},
    {summary:{$regex:search,$options:"i"}},
    {definition:{$regex:search,$options:"i"}},
    {formula:{$regex:search,$options:"i"}},
    {example:{$regex:search,$options:"i"}},
    {unit:{$regex:search,$options:"i"}},
    {relatedBand:{$regex:search,$options:"i"}},
    {relatedMode:{$regex:search,$options:"i"}},
    {aliases:{$regex:search,$options:"i"}}
   ];
  }

  const records=await TechnicalReference.find(filter).sort({category:1,title:1});
  res.json(records);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const getTechnicalReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await TechnicalReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Technical reference not found."});

  res.json(record);
 }catch(error){
  res.status(500).json({message:error.message});
 }
};

export const createTechnicalReference=async(req,res)=>{
 try{
  const record=await TechnicalReference.create({
   business:req.body.business,
   title:req.body.title,
   category:req.body.category,
   summary:req.body.summary||"",
   definition:req.body.definition,
   formula:req.body.formula||"",
   example:req.body.example||"",
   unit:req.body.unit||"",
   relatedBand:req.body.relatedBand||"",
   relatedMode:req.body.relatedMode||"",
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
  if(error.code===11000)return res.status(409).json({message:"This technical reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const updateTechnicalReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await TechnicalReference.findOneAndUpdate({_id:req.params.id,business},{
   title:req.body.title,
   category:req.body.category,
   summary:req.body.summary||"",
   definition:req.body.definition,
   formula:req.body.formula||"",
   example:req.body.example||"",
   unit:req.body.unit||"",
   relatedBand:req.body.relatedBand||"",
   relatedMode:req.body.relatedMode||"",
   aliases:cleanArray(req.body.aliases),
   sourceName:req.body.sourceName||"",
   sourceUrl:req.body.sourceUrl||"",
   notes:req.body.notes||"",
   isActive:req.body.isActive!==false,
   updatedBy:getUserId(req)
  },{returnDocument:"after",runValidators:true});

  if(!record)return res.status(404).json({message:"Technical reference not found."});
  res.json(record);
 }catch(error){
  if(error.code===11000)return res.status(409).json({message:"This technical reference already exists."});
  res.status(400).json({message:error.message});
 }
};

export const deleteTechnicalReference=async(req,res)=>{
 try{
  const {business}=req.query;
  if(!business)return res.status(400).json({message:"Business is required."});

  const record=await TechnicalReference.findOne({_id:req.params.id,business});
  if(!record)return res.status(404).json({message:"Technical reference not found."});
  if(record.isSystem)return res.status(403).json({message:"System records cannot be deleted."});

  await record.deleteOne();
  res.json({message:"Technical reference deleted."});
 }catch(error){
  res.status(500).json({message:error.message});
 }
};