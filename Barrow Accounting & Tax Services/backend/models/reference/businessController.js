// backend/controllers/reference/businessController.js
import Business from "../../models/reference/businessModel.js";
import BusinessType from "../../models/reference/businessTypeModel.js";
import Tagline from "../../models/reference/taglineModel.js";
import Footer from "../../models/reference/footerModel.js";
import ReceiptTemplate from "../../models/reference/receiptTemplateModel.js";
import ReceiptHeader from "../../models/reference/receiptHeaderModel.js";
import ReceiptSubHeader from "../../models/reference/receiptSubHeaderModel.js";
import ReceiptFooter from "../../models/reference/receiptFooterModel.js";
import Occasion from "../../models/reference/occasionModel.js";
import Season from "../../models/reference/seasonsModel.js";
import State from "../../models/locations/stateModel.js";
import County from "../../models/locations/countyModel.js";
import Country from "../../models/locations/countryModel.js";
import AppKey from "../../models/reference/appKeyModel.js";
import TaxRate from "../../models/reference/TaxRateModel.js";

const receiptNestedPopulate=[
 {path:"seasonRef",model:"Season"},
 {path:"occasionRef",model:"Occasion",populate:{path:"seasonRef",model:"Season"}}
];

const businessPopulate=[
 {path:"typeRef",model:"BusinessType"},
 {path:"taxRateRef",model:"TaxRate"},
 {path:"taglineId",model:"Tagline"},
 {path:"footerId",model:"Footer"},
 {path:"receiptTemplateId",model:"ReceiptTemplate",populate:receiptNestedPopulate},
 {path:"receiptHeaderId",model:"ReceiptHeader",populate:receiptNestedPopulate},
 {path:"receiptSubHeaderId",model:"ReceiptSubHeader",populate:receiptNestedPopulate},
 {path:"receiptFooterId",model:"ReceiptFooter",populate:receiptNestedPopulate},
 {path:"stateRef",model:"State"},
 {path:"countyRef",model:"County"},
 {path:"countryRef",model:"Country"}
];

const normalizeGradientToken=value=>{
 if(typeof value==="string")return value.trim();
 if(value&&typeof value==="object"&&typeof value.value==="string")return value.value.trim();
 return "";
};

const cleanString=value=>{
 return value===undefined||value===null?"":String(value).trim();
};

const cleanNumber=(value,defaultValue=0)=>{
 const number=Number(value);
 return Number.isFinite(number)?number:defaultValue;
};

const clampNumber=(value,min,max,defaultValue=0)=>{
 const number=cleanNumber(value,defaultValue);
 return Math.max(min,Math.min(max,number));
};

const allowedGradientDirections=[
 "180deg",
 "0deg",
 "90deg",
 "270deg",
 "135deg",
 "225deg",
 "45deg",
 "315deg"
];

const normalizeBackgroundTreatment=value=>{
 const incoming=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 const allowedModes=["color","gradient","image"];
 const mode=allowedModes.includes(incoming.mode)?incoming.mode:"color";
 const gradientToken=["gradientMain","gradientSoft"].includes(incoming.gradientToken)?incoming.gradientToken:"gradientSoft";
 const gradientType=["linear","radial"].includes(incoming.gradientType)?incoming.gradientType:"linear";
 const gradientDirectionMode=["preset","custom"].includes(incoming.gradientDirectionMode)?incoming.gradientDirectionMode:"preset";
 const gradientDirection=cleanString(incoming.gradientDirection)||"180deg";
 const presetDirection=allowedGradientDirections.includes(gradientDirection)?gradientDirection:"180deg";

 return {
  mode,
  image:cleanString(incoming.image),
  imageOpacity:clampNumber(incoming.imageOpacity,0,1,0.08),
  imageSize:cleanString(incoming.imageSize)||"cover",
  imagePosition:cleanString(incoming.imagePosition)||"center",
  imageRepeat:cleanString(incoming.imageRepeat)||"no-repeat",
  overlayOpacity:clampNumber(incoming.overlayOpacity,0,1,0),
  gradientToken,
  gradientType,
  gradientDirectionMode,
  gradientDirection:gradientDirectionMode==="preset"?presetDirection:gradientDirection,
  gradientStart:cleanString(incoming.gradientStart)||"#cfdcc8",
  gradientEnd:cleanString(incoming.gradientEnd)||"#b7c9ad",
  gradientStartStop:clampNumber(incoming.gradientStartStop,0,100,0),
  gradientEndStop:clampNumber(incoming.gradientEndStop,0,100,100)
 };
};

const normalizeThemeColors=themeColors=>{
 if(!themeColors||typeof themeColors!=="object")return themeColors;

 return {
  ...themeColors,
  gradientMain:normalizeGradientToken(themeColors.gradientMain),
  gradientSoft:normalizeGradientToken(themeColors.gradientSoft),
  backgroundTreatment:normalizeBackgroundTreatment(themeColors.backgroundTreatment)
 };
};

const normalizeBusinessPayload=payload=>{
 const nextPayload={...payload};

 if(nextPayload.code==="")nextPayload.code=undefined;

 if(nextPayload.taxRateRef==="")nextPayload.taxRateRef=null;

 if(nextPayload.themeColors){
  nextPayload.themeColors=normalizeThemeColors(nextPayload.themeColors);
 }

 if(nextPayload.receiptsEnabled===false){
  nextPayload.receiptTemplateId=null;
  nextPayload.receiptHeaderId=null;
  nextPayload.receiptSubHeaderId=null;
  nextPayload.receiptFooterId=null;
  nextPayload.showLogoOnReceipt=false;
  nextPayload.showTaxRateOnReceipt=false;
  nextPayload.showWebsiteOnReceipt=false;
  nextPayload.showEmailOnReceipt=false;
  nextPayload.showPhoneOnReceipt=false;
  nextPayload.showFaxOnReceipt=false;
  nextPayload.showAddressOnReceipt=false;
 }

 return nextPayload;
};

const ensureReferenceModels=async()=>{
 await BusinessType;
 await TaxRate;
 await Tagline;
 await Footer;
 await ReceiptTemplate;
 await ReceiptHeader;
 await ReceiptSubHeader;
 await ReceiptFooter;
 await Occasion;
 await Season;
 await State;
 await County;
 await Country;
 await AppKey;
};

const attachAppKeyToBusiness=async business=>{
 if(!business)return business;
 const businessObj=business.toObject?business.toObject():business;
 const appKey=await AppKey.findOne({businessRef:businessObj._id});
 return {...businessObj,appKey:appKey||null};
};

const attachAppKeysToBusinesses=async businesses=>{
 const businessIds=businesses.map(item=>item._id);
 const appKeys=await AppKey.find({businessRef:{$in:businessIds}});
 const appKeyMap=new Map(appKeys.map(item=>[String(item.businessRef),item]));

 return businesses.map(item=>{
  const businessObj=item.toObject?item.toObject():item;
  return {...businessObj,appKey:appKeyMap.get(String(businessObj._id))||null};
 });
};

export const createBusiness=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const business=await Business.create(normalizeBusinessPayload(req.body));

  const populatedBusiness=await Business.findById(business._id)
   .populate(businessPopulate);

  const result=await attachAppKeyToBusiness(populatedBusiness);

  res.status(201).json(result);
 }catch(error){
  next(error);
 }
};

export const getBusinesses=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const businesses=await Business.find()
   .populate(businessPopulate)
   .sort({createdAt:-1});

  const results=await attachAppKeysToBusinesses(businesses);

  res.status(200).json(results);
 }catch(error){
  next(error);
 }
};

export const getBusinessById=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const business=await Business.findById(req.params.id)
   .populate(businessPopulate);

  if(!business)return res.status(404).json({message:"Business not found"});

  const result=await attachAppKeyToBusiness(business);

  res.status(200).json(result);
 }catch(error){
  next(error);
 }
};

export const updateBusiness=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const updated=await Business.findByIdAndUpdate(
   req.params.id,
   normalizeBusinessPayload(req.body),
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Business not found"});

  const populatedBusiness=await Business.findById(updated._id)
   .populate(businessPopulate);

  const result=await attachAppKeyToBusiness(populatedBusiness);

  res.status(200).json(result);
 }catch(error){
  next(error);
 }
};

export const updateBusinessBackgroundTreatment=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const updated=await Business.findByIdAndUpdate(
   req.params.id,
   {
    $set:{
     "themeColors.backgroundTreatment":normalizeBackgroundTreatment(req.body)
    }
   },
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Business not found"});

  const populatedBusiness=await Business.findById(updated._id)
   .populate(businessPopulate);

  const result=await attachAppKeyToBusiness(populatedBusiness);

  res.status(200).json(result);
 }catch(error){
  next(error);
 }
};

export const toggleBusinessReceipts=async(req,res,next)=>{
 try{
  await ensureReferenceModels();

  const updated=await Business.findByIdAndUpdate(
   req.params.id,
   normalizeBusinessPayload({receiptsEnabled:!!req.body?.receiptsEnabled}),
   {returnDocument:"after",runValidators:true}
  );

  if(!updated)return res.status(404).json({message:"Business not found"});

  const populatedBusiness=await Business.findById(updated._id)
   .populate(businessPopulate);

  const result=await attachAppKeyToBusiness(populatedBusiness);

  res.status(200).json(result);
 }catch(error){
  next(error);
 }
};

export const deleteBusiness=async(req,res,next)=>{
 try{
  const business=await Business.findByIdAndDelete(req.params.id);

  if(!business)return res.status(404).json({message:"Business not found"});

  await AppKey.findOneAndDelete({businessRef:req.params.id});

  res.status(200).json({message:"Business deleted successfully"});
 }catch(error){
  next(error);
 }
};
