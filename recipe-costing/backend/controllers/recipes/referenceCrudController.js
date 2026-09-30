const duplicateMessage=(label,error)=>{
 if(error?.code!==11000)return null;
 const field=Object.keys(error.keyPattern||{})[0]||"value";
 return `${label} with that ${field} already exists`;
};

export const createReferenceCrudController=(Model,label)=>{
 const getAll=async(req,res)=>{
  try{
   const query={};
   if(req.query.isActive==="true")query.isActive=true;
   if(req.query.isActive==="false")query.isActive=false;
   const rows=await Model.find(query).sort({name:1,createdAt:-1}).lean();
   res.status(200).json(rows);
  }catch(error){
   res.status(500).json({message:`Failed to load ${label.toLowerCase()} records`,error:error.message});
  }
 };

 const getById=async(req,res)=>{
  try{
   const row=await Model.findById(req.params.id).lean();
   if(!row)return res.status(404).json({message:`${label} not found`});
   res.status(200).json(row);
  }catch(error){
   res.status(400).json({message:`Failed to load ${label.toLowerCase()}`,error:error.message});
  }
 };

 const create=async(req,res)=>{
  try{
   const row=await Model.create(req.body);
   res.status(201).json(row);
  }catch(error){
   res.status(400).json({
    message:duplicateMessage(label,error)||`Failed to create ${label.toLowerCase()}`,
    error:error.message
   });
  }
 };

 const update=async(req,res)=>{
  try{
   const row=await Model.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}).lean();
   if(!row)return res.status(404).json({message:`${label} not found`});
   res.status(200).json(row);
  }catch(error){
   res.status(400).json({
    message:duplicateMessage(label,error)||`Failed to update ${label.toLowerCase()}`,
    error:error.message
   });
  }
 };

 const remove=async(req,res)=>{
  try{
   const row=await Model.findByIdAndDelete(req.params.id).lean();
   if(!row)return res.status(404).json({message:`${label} not found`});
   res.status(200).json({message:`${label} deleted successfully`,data:row});
  }catch(error){
   res.status(400).json({message:`Failed to delete ${label.toLowerCase()}`,error:error.message});
  }
 };

 return{getAll,getById,create,update,remove};
};
