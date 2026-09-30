// backend/controllers/methods/bibleStudyMethodController.js
import mongoose from "mongoose";
import BibleStudyMethod from "../../models/methods/BibleStudyMethodsModel.js";

const populateBibleStudyMethod=[
 {path:"category",model:"StudyCategory"},
 {path:"difficulty",model:"DifficultyLevel"},
 {path:"methodFamily",model:"BibleStudyMethod",select:"title slug subtitle icon"},
 {path:"relatedMethods",model:"BibleStudyMethod",select:"title slug subtitle icon category difficulty"}
];

export const getBibleStudyMethods=async(req,res)=>{
 try{
  const {
   category,
   difficulty,
   methodFamily,
   isMainMethod,
   tag,
   slug,
   search
  }=req.query;

  const filter={};

  if(category&&mongoose.Types.ObjectId.isValid(category))filter.category=category;
  if(difficulty&&mongoose.Types.ObjectId.isValid(difficulty))filter.difficulty=difficulty;
  if(methodFamily==="null")filter.methodFamily=null;
  else if(methodFamily&&mongoose.Types.ObjectId.isValid(methodFamily))filter.methodFamily=methodFamily;
  if(isMainMethod!==undefined)filter.isMainMethod=isMainMethod==="true";
  if(slug)filter.slug=slug.toLowerCase();
  if(tag)filter.tags={$in:[tag]};
  if(search){
   filter.$or=[
    {title:{$regex:search,$options:"i"}},
    {subtitle:{$regex:search,$options:"i"}},
    {description:{$regex:search,$options:"i"}},
    {overview:{$regex:search,$options:"i"}},
    {purpose:{$regex:search,$options:"i"}},
    {whatIsThisMethod:{$regex:search,$options:"i"}},
    {whyUseThisMethod:{$regex:search,$options:"i"}},
    {biblicalBasis:{$regex:search,$options:"i"}},
    {hermeneuticalBasis:{$regex:search,$options:"i"}},
    {whyThisMethodIsValidInScripture:{$regex:search,$options:"i"}},
    {whenToUse:{$regex:search,$options:"i"}},
    {whenNotToUse:{$regex:search,$options:"i"}},
    {howToThinkAboutIt:{$regex:search,$options:"i"}},
    {analogy:{$regex:search,$options:"i"}},
    {mainOutcome:{$regex:search,$options:"i"}},
    {spiritualOutcome:{$regex:search,$options:"i"}},
    {coreSpiritualOutcome:{$regex:search,$options:"i"}},
    {roleInOverallBibleStudy:{$regex:search,$options:"i"}},
    {howThisMethodFitsInACompleteStudySystem:{$regex:search,$options:"i"}},
    {finalThought:{$regex:search,$options:"i"}},
    {tags:{$elemMatch:{$regex:search,$options:"i"}}},
    {audience:{$elemMatch:{$regex:search,$options:"i"}}},
    {bestFor:{$elemMatch:{$regex:search,$options:"i"}}},
    {goals:{$elemMatch:{$regex:search,$options:"i"}}},
    {learningOutcomes:{$elemMatch:{$regex:search,$options:"i"}}},
    {idealStudyContexts:{$elemMatch:{$regex:search,$options:"i"}}},
    {complementaryMethods:{$elemMatch:{$regex:search,$options:"i"}}},
    {lessIdealFor:{$elemMatch:{$regex:search,$options:"i"}}},
    {bestUseCases:{$elemMatch:{$regex:search,$options:"i"}}},
    {"subMethods.title":{$regex:search,$options:"i"}},
    {"steps.title":{$regex:search,$options:"i"}},
    {"steps.content":{$regex:search,$options:"i"}},
    {"transformationMarkers.category":{$regex:search,$options:"i"}},
    {"transformationMarkers.markers":{$elemMatch:{$regex:search,$options:"i"}}}
   ];
  }

  const methods=await BibleStudyMethod.find(filter)
   .populate(populateBibleStudyMethod)
   .sort({title:1});

  return res.status(200).json({
   success:true,
   count:methods.length,
   data:methods
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch bible study methods",
   error:err.message
  });
 }
};

export const getBibleStudyMethodById=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid bible study method id"
   });
  }

  const method=await BibleStudyMethod.findById(req.params.id)
   .populate(populateBibleStudyMethod);

  if(!method){
   return res.status(404).json({
    success:false,
    message:"Bible study method not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:method
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch bible study method",
   error:err.message
  });
 }
};

export const getBibleStudyMethodBySlug=async(req,res)=>{
 try{
  const method=await BibleStudyMethod.findOne({slug:req.params.slug.toLowerCase()})
   .populate(populateBibleStudyMethod);

  if(!method){
   return res.status(404).json({
    success:false,
    message:"Bible study method not found"
   });
  }

  return res.status(200).json({
   success:true,
   data:method
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to fetch bible study method",
   error:err.message
  });
 }
};

export const createBibleStudyMethod=async(req,res)=>{
 try{
  if(req.body.slug)req.body.slug=req.body.slug.toLowerCase();

  const method=await BibleStudyMethod.create(req.body);
  const createdMethod=await BibleStudyMethod.findById(method._id)
   .populate(populateBibleStudyMethod);

  return res.status(201).json({
   success:true,
   message:"Bible study method created successfully",
   data:createdMethod
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to create bible study method",
   error:err.message
  });
 }
};

export const updateBibleStudyMethod=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid bible study method id"
   });
  }

  if(req.body.slug)req.body.slug=req.body.slug.toLowerCase();

  const method=await BibleStudyMethod.findByIdAndUpdate(req.params.id,req.body,{
   returnDocument:"after",
   runValidators:true
  }).populate(populateBibleStudyMethod);

  if(!method){
   return res.status(404).json({
    success:false,
    message:"Bible study method not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Bible study method updated successfully",
   data:method
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to update bible study method",
   error:err.message
  });
 }
};

export const deleteBibleStudyMethod=async(req,res)=>{
 try{
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
   return res.status(400).json({
    success:false,
    message:"Invalid bible study method id"
   });
  }

  const method=await BibleStudyMethod.findByIdAndDelete(req.params.id);

  if(!method){
   return res.status(404).json({
    success:false,
    message:"Bible study method not found"
   });
  }

  return res.status(200).json({
   success:true,
   message:"Bible study method deleted successfully"
  });
 }
 catch(err){
  return res.status(500).json({
   success:false,
   message:"Failed to delete bible study method",
   error:err.message
  });
 }
};