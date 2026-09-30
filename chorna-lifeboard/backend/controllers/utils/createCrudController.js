// backend/controllers/utils/createCrudController.js

const getAuthUser=req=>{
 return req?.user?._id||req?.user?.id||null;
};

const getBodyUser=req=>{
 return req?.body?.user||req?.query?.user||null;
};

const getQueryUser=req=>{
 return getAuthUser(req)||req?.query?.user||null;
};

const buildUserQuery=req=>{
 const user=getQueryUser(req);
 return user?{user}:{};
};

const getSingleKey=dataKey=>{
 if(!dataKey)return "record";
 if(dataKey.endsWith("ies"))return `${dataKey.slice(0,-3)}y`;
 if(dataKey.endsWith("s"))return dataKey.slice(0,-1);
 return "record";
};

const createCrudController=({Model,dataKey,defaultSort={createdAt:-1},forceUser=true,populate=""})=>{

 const applyPopulate=query=>{
  return populate?query.populate(populate):query;
 };

 const getAll=async(req={},res)=>{
  try{
   const query=forceUser?buildUserQuery(req):{};

   Object.entries(req.query||{}).forEach(([key,value])=>{
    if(["user","page","limit","sort"].includes(key))return;
    if(value!==undefined&&value!==""&&value!=="all")query[key]=value;
   });

   const records=await applyPopulate(Model.find(query)).sort(defaultSort);

   res.status(200).json({success:true,[dataKey]:records});
  }catch(error){
   res.status(500).json({success:false,message:error.message});
  }
 };

 const getById=async(req={},res)=>{
  try{
   const query={_id:req.params?.id};

   if(forceUser){
    Object.assign(query,buildUserQuery(req));
   }

   const record=await applyPopulate(Model.findOne(query));

   if(!record){
    return res.status(404).json({success:false,message:"Record not found"});
   }

   res.status(200).json({success:true,[getSingleKey(dataKey)]:record});
  }catch(error){
   res.status(500).json({success:false,message:error.message});
  }
 };

 const create=async(req={},res)=>{
  try{
   const authUser=getAuthUser(req);
   const bodyUser=getBodyUser(req);
   const payload={...(req.body||{})};

   if(forceUser){
    payload.user=authUser||bodyUser||payload.user;
   }

   const record=await Model.create(payload);

   res.status(201).json({success:true,[getSingleKey(dataKey)]:record});
  }catch(error){
   res.status(500).json({success:false,message:error.message});
  }
 };

 const update=async(req={},res)=>{
  try{
   const query={_id:req.params?.id};
   const payload={...(req.body||{})};

   if(forceUser){
    Object.assign(query,buildUserQuery(req));
   }

   delete payload.user;
   delete payload._id;
   delete payload.id;
   delete payload.createdAt;
   delete payload.updatedAt;
   delete payload.__v;

   const record=await Model.findOneAndUpdate(
    query,
    payload,
    {returnDocument:"after",runValidators:true}
   );

   if(!record){
    return res.status(404).json({success:false,message:"Record not found"});
   }

   res.status(200).json({success:true,[getSingleKey(dataKey)]:record});
  }catch(error){
   res.status(500).json({success:false,message:error.message});
  }
 };

 const remove=async(req={},res)=>{
  try{
   const query={_id:req.params?.id};

   if(forceUser){
    Object.assign(query,buildUserQuery(req));
   }

   const record=await Model.findOneAndDelete(query);

   if(!record){
    return res.status(404).json({success:false,message:"Record not found"});
   }

   res.status(200).json({success:true,message:"Record deleted"});
  }catch(error){
   res.status(500).json({success:false,message:error.message});
  }
 };

 return {getAll,getById,create,update,remove};
};

export default createCrudController;