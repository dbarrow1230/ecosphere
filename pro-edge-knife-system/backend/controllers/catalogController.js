import KnifeType from "../models/knifeTypeModel.js";
import ProductTier from "../models/tierModel.js";

const sendError=(res,error)=>res.status(error?.code===11000?409:400).json({message:error.message});

export const getKnifeTypes=async(req,res,next)=>{
 try{res.json(await KnifeType.find().sort({category:1,name:1}));}catch(error){next(error);}
};

export const createKnifeType=async(req,res,next)=>{
 try{res.status(201).json(await KnifeType.create(req.body));}catch(error){if(error?.name==="ValidationError"||error?.code===11000)return sendError(res,error);next(error);}
};

export const updateKnifeType=async(req,res,next)=>{
 try{
  const record=await KnifeType.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!record)return res.status(404).json({message:"Knife type not found"});
  res.json(record);
 }catch(error){if(error?.name==="ValidationError"||error?.code===11000)return sendError(res,error);next(error);}
};

export const deleteKnifeType=async(req,res,next)=>{
 try{
  const inUse=await ProductTier.exists({"includedItems.knifeTypeRef":req.params.id});
  if(inUse)return res.status(409).json({message:"Knife type is assigned to a product tier"});
  const record=await KnifeType.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Knife type not found"});
  res.json({message:"Knife type deleted"});
 }catch(error){next(error);}
};

export const getTiers=async(req,res,next)=>{
 try{res.json(await ProductTier.find().populate("includedItems.knifeTypeRef").sort({level:1}));}catch(error){next(error);}
};

export const createTier=async(req,res,next)=>{
 try{res.status(201).json(await ProductTier.create(req.body));}catch(error){if(error?.name==="ValidationError"||error?.code===11000)return sendError(res,error);next(error);}
};

export const updateTier=async(req,res,next)=>{
 try{
  const record=await ProductTier.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
  if(!record)return res.status(404).json({message:"Product tier not found"});
  res.json(await record.populate("includedItems.knifeTypeRef"));
 }catch(error){if(error?.name==="ValidationError"||error?.code===11000)return sendError(res,error);next(error);}
};

export const ensureDefaultCatalog=async()=>{
  const knifeDefaults=[
   {name:"Chef Knife",code:"CHEF",category:"standard",defaultBladeLength:8,defaultEdgeAngle:15},
   {name:"Paring Knife",code:"PARING",category:"standard",defaultBladeLength:3.5,defaultEdgeAngle:15},
   {name:"Utility Knife",code:"UTILITY",category:"standard",defaultBladeLength:6,defaultEdgeAngle:15},
   {name:"Bread Knife",code:"BREAD",category:"standard",defaultBladeLength:8,defaultEdgeAngle:18},
   {name:"Truffle Slicer",code:"TRUFFLE",category:"specialty",defaultBladeLength:3,defaultEdgeAngle:12},
   {name:"Santoku",code:"SANTOKU",category:"specialty",defaultBladeLength:7,defaultEdgeAngle:12},
   {name:"Nakiri",code:"NAKIRI",category:"specialty",defaultBladeLength:6.5,defaultEdgeAngle:12},
   {name:"Boning Knife",code:"BONING",category:"specialty",defaultBladeLength:6,defaultEdgeAngle:15},
   {name:"Cleaver",code:"CLEAVER",category:"specialty",defaultBladeLength:7,defaultEdgeAngle:18}
  ];

  for(const item of knifeDefaults)await KnifeType.findOneAndUpdate({code:item.code},{$setOnInsert:item},{upsert:true,returnDocument:"after",setDefaultsOnInsert:true});
  const knives=await KnifeType.find();
  const byCode=Object.fromEntries(knives.map(item=>[item.code,item]));
  const basicItems=["CHEF","PARING","UTILITY","BREAD"].map(code=>({knifeTypeRef:byCode[code]._id,quantity:1}));
  const proItems=[...basicItems,{knifeTypeRef:byCode.TRUFFLE._id,quantity:1}];
  const proMaxItems=[...proItems,...["SANTOKU","NAKIRI","BONING","CLEAVER"].map(code=>({knifeTypeRef:byCode[code]._id,quantity:1}))];
  const defaults=[
   {name:"Basic",code:"BASIC",level:1,shortDescription:"The default Pro Edge knife set.",includedItems:basicItems,allowCustomization:false},
   {name:"Pro",code:"PRO",level:2,shortDescription:"The Basic set plus the truffle slicer.",includedItems:proItems,allowCustomization:false},
   {name:"Pro Max",code:"PRO_MAX",level:3,shortDescription:"The expanded set for additional non-standard knives.",includedItems:proMaxItems,allowCustomization:false},
   {name:"Custom",code:"CUSTOM",level:4,shortDescription:"Build a Pro Edge set from available knife types and options.",includedItems:[],allowCustomization:true}
  ];

  for(const tier of defaults)await ProductTier.findOneAndUpdate({code:tier.code},{$setOnInsert:tier},{upsert:true,returnDocument:"after",setDefaultsOnInsert:true});
  return {knifeTypes:await KnifeType.countDocuments(),tiers:await ProductTier.countDocuments()};
};

export const seedCatalog=async(req,res,next)=>{
 try{
  res.json(await ensureDefaultCatalog());
 }catch(error){next(error);}
};
