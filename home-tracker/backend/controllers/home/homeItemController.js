import HomeItem from "../../models/home/homeItemModel.js";

const getBusinessFilter=req=>req.query?.business||req.body?.business||req.user?.business_id||req.user?.business||null;

const normalizeItemPayload=body=>({
 business:body.business||null,
 name:body.name?.trim(),
 brand:body.brand?.trim()||"",
 barcode:body.barcode?.trim()||"",
 storageType:body.storageType||"pantry",
 category:body.category||null,
 location:body.location||null,
 quantity:Number(body.quantity??0),
 minimumQuantity:Number(body.minimumQuantity??0),
 parLevel:Number(body.parLevel??0),
 unit:body.unit?.trim()||"each",
 cost:Number(body.cost??0),
 purchaseDate:body.purchaseDate||null,
 expirationDate:body.expirationDate||null,
 status:body.status||"active",
 shoppingList:Boolean(body.shoppingList),
 notes:body.notes?.trim()||""
});

const populateItem=query=>query.populate("category").populate("location");

const buildItemFilter=req=>{
 const filter={};
 const business=getBusinessFilter(req);
 if(business)filter.business=business;
 if(req.query.storageType)filter.storageType=req.query.storageType;
 if(req.query.status)filter.status=req.query.status;
 if(req.query.category)filter.category=req.query.category;
 if(req.query.location)filter.location=req.query.location;
 if(req.query.shoppingList==="true")filter.shoppingList=true;

 if(req.query.lowStock==="true"){
  filter.$expr={$lte:["$quantity","$minimumQuantity"]};
  filter.minimumQuantity={$gt:0};
  filter.status={$nin:["discarded","used"]};
 }

 if(req.query.expiringDays){
  const now=new Date();
  const end=new Date(now);
  end.setDate(end.getDate()+Number(req.query.expiringDays||30));
  filter.expirationDate={$gte:now,$lte:end};
  filter.status={$nin:["discarded","used"]};
 }

 if(req.query.search?.trim())filter.$text={$search:req.query.search.trim()};

 return filter;
};

export const createHomeItem=async(req,res,next)=>{
 try{
  const payload=normalizeItemPayload(req.body);
  payload.business=getBusinessFilter(req);

  if(!payload.name)return res.status(400).json({message:"Item name is required"});

  const item=await HomeItem.create(payload);
  const populatedItem=await populateItem(HomeItem.findById(item._id));

  return res.status(201).json({item:populatedItem});
 }catch(error){
  return next(error);
 }
};

export const getHomeItems=async(req,res,next)=>{
 try{
  const filter=buildItemFilter(req);
  const items=await populateItem(HomeItem.find(filter)).sort({name:1}).lean();
  return res.json({items});
 }catch(error){
  return next(error);
 }
};

export const getHomeItemById=async(req,res,next)=>{
 try{
  const item=await populateItem(HomeItem.findById(req.params.id)).lean();
  if(!item)return res.status(404).json({message:"Item not found"});
  return res.json(item);
 }catch(error){
  return next(error);
 }
};

export const updateHomeItem=async(req,res,next)=>{
 try{
  const payload=normalizeItemPayload(req.body);
  const business=getBusinessFilter(req);
  if(business)payload.business=business;
  else delete payload.business;

  if(!payload.name)return res.status(400).json({message:"Item name is required"});

  const item=await populateItem(HomeItem.findByIdAndUpdate(req.params.id,payload,{new:true,runValidators:true}));
  if(!item)return res.status(404).json({message:"Item not found"});

  return res.json({item});
 }catch(error){
  return next(error);
 }
};

export const deleteHomeItem=async(req,res,next)=>{
 try{
  const item=await HomeItem.findByIdAndDelete(req.params.id);
  if(!item)return res.status(404).json({message:"Item not found"});
  return res.json({message:"Item deleted successfully"});
 }catch(error){
  return next(error);
 }
};
