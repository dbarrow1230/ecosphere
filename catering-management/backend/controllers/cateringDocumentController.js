const invalidId=error=>error?.name==="CastError";

export const createDocumentController=(Model,label)=>({
 create:async(req,res)=>{
  try{
   const document=await Model.create(req.body);
   return res.status(201).json({success:true,message:`${label} saved successfully`,data:document});
  }catch(error){
   const status=error?.code===11000?409:400;
   return res.status(status).json({success:false,message:error?.code===11000?`${label} number already exists`:error.message});
  }
 },
 list:async(req,res)=>{
  try{
   const documents=await Model.find().sort({updatedAt:-1}).lean();
   return res.json({success:true,count:documents.length,data:documents});
  }catch(error){return res.status(500).json({success:false,message:error.message});}
 },
 get:async(req,res)=>{
  try{
   const document=await Model.findById(req.params.id).lean();
   if(!document)return res.status(404).json({success:false,message:`${label} not found`});
   return res.json({success:true,data:document});
  }catch(error){return res.status(invalidId(error)?400:500).json({success:false,message:error.message});}
 },
 update:async(req,res)=>{
  try{
   const document=await Model.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
   if(!document)return res.status(404).json({success:false,message:`${label} not found`});
   return res.json({success:true,message:`${label} updated successfully`,data:document});
  }catch(error){
   const status=error?.code===11000?409:invalidId(error)?400:400;
   return res.status(status).json({success:false,message:error?.code===11000?`${label} number already exists`:error.message});
  }
 },
 remove:async(req,res)=>{
  try{
   const document=await Model.findByIdAndDelete(req.params.id);
   if(!document)return res.status(404).json({success:false,message:`${label} not found`});
   return res.json({success:true,message:`${label} deleted successfully`});
  }catch(error){return res.status(invalidId(error)?400:500).json({success:false,message:error.message});}
 }
});
