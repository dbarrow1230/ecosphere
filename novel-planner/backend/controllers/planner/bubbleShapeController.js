// backend/controllers/planner/bubbleShapeController.js
import BubbleShape from "../../models/planner/bubbleShapeModel.js";

const allowedShapeCssProperties=new Set(["border-radius","clip-path","border","border-width","border-style","border-color","background","background-color","box-shadow","transform"]);

const sanitizeShapeCss=value=>String(value||"").split(";").map(declaration=>declaration.trim()).filter(Boolean).map(declaration=>{
 const separator=declaration.indexOf(":");
 if(separator<1)return "";
 const property=declaration.slice(0,separator).trim().toLowerCase();
 const cssValue=declaration.slice(separator+1).trim();
 if(!allowedShapeCssProperties.has(property)||!cssValue||/[{}@]|url\s*\(|expression\s*\(|javascript:/i.test(cssValue))return "";
 return `${property}:${cssValue}`;
}).filter(Boolean).join(";");

export const getBubbleShapes=async(req,res)=>{
 try{
  const filter={isActive:true};

  if(req.query.business_id)filter.business_id=req.query.business_id;
  if(req.query.user_id)filter.user_id=req.query.user_id;

  const bubbleShapes=await BubbleShape.find(filter).sort({name:1});

  res.status(200).json({
   success:true,
   count:bubbleShapes.length,
   data:bubbleShapes
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get bubble shapes",
   error:error.message
  });
 }
};

export const getBubbleShapeById=async(req,res)=>{
 try{
  const bubbleShape=await BubbleShape.findById(req.params.id);

  if(!bubbleShape){
   return res.status(404).json({
    success:false,
    message:"Bubble shape not found"
   });
  }

  res.status(200).json({
   success:true,
   data:bubbleShape
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to get bubble shape",
   error:error.message
  });
 }
};

export const createBubbleShape=async(req,res)=>{
 try{
  const bubbleShape=await BubbleShape.create({...req.body,customCss:sanitizeShapeCss(req.body.customCss)});

  res.status(201).json({
   success:true,
   message:"Bubble shape created",
   data:bubbleShape
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Bubble shape already exists for this business and user"
   });
  }

  res.status(500).json({
   success:false,
   message:"Failed to create bubble shape",
   error:error.message
  });
 }
};

export const updateBubbleShape=async(req,res)=>{
 try{
  const update={...req.body};
  if(Object.hasOwn(update,"customCss"))update.customCss=sanitizeShapeCss(update.customCss);
  const bubbleShape=await BubbleShape.findByIdAndUpdate(
   req.params.id,
   update,
   {returnDocument:"after",runValidators:true}
  );

  if(!bubbleShape){
   return res.status(404).json({
    success:false,
    message:"Bubble shape not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Bubble shape updated",
   data:bubbleShape
  });
 }catch(error){
  if(error.code===11000){
   return res.status(409).json({
    success:false,
    message:"Bubble shape already exists for this business and user"
   });
  }

  res.status(500).json({
   success:false,
   message:"Failed to update bubble shape",
   error:error.message
  });
 }
};

export const archiveBubbleShape=async(req,res)=>{
 try{
  const bubbleShape=await BubbleShape.findByIdAndUpdate(
   req.params.id,
   {
    isActive:false,
    updatedBy:req.body.updatedBy||req.body.user_id||null
   },
   {returnDocument:"after"}
  );

  if(!bubbleShape){
   return res.status(404).json({
    success:false,
    message:"Bubble shape not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Bubble shape archived",
   data:bubbleShape
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to archive bubble shape",
   error:error.message
  });
 }
};

export const deleteBubbleShape=async(req,res)=>{
 try{
  const bubbleShape=await BubbleShape.findByIdAndDelete(req.params.id);

  if(!bubbleShape){
   return res.status(404).json({
    success:false,
    message:"Bubble shape not found"
   });
  }

  res.status(200).json({
   success:true,
   message:"Bubble shape deleted",
   data:bubbleShape
  });
 }catch(error){
  res.status(500).json({
   success:false,
   message:"Failed to delete bubble shape",
   error:error.message
  });
 }
};
