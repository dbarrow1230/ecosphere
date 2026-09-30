import HaccpLog from "../../models/recipes/HaccpLogModel.js";

export const getHaccpLogs=async(req,res)=>{
 try{const filter={};for(const key of ["business","recipe","status"])if(req.query[key])filter[key]=req.query[key];if(req.query.dateFrom||req.query.dateTo)filter.productionDate={...(req.query.dateFrom?{$gte:new Date(req.query.dateFrom)}:{}),...(req.query.dateTo?{$lte:new Date(req.query.dateTo)}:{})};const logs=await HaccpLog.find(filter).populate("recipe","name recipeNumber").sort({productionDate:-1,createdAt:-1});return res.json(logs);}
 catch(error){return res.status(500).json({message:"Failed to fetch HACCP logs",error:error.message});}
};
export const createHaccpLog=async(req,res)=>{try{const log=await HaccpLog.create(req.body);return res.status(201).json({message:"HACCP log saved",log});}catch(error){if(error.code===11000)return res.status(409).json({message:"Batch code already exists."});return res.status(500).json({message:"Failed to save HACCP log",error:error.message});}};
export const updateHaccpLog=async(req,res)=>{try{const log=await HaccpLog.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});if(!log)return res.status(404).json({message:"HACCP log not found"});return res.json({message:"HACCP log updated",log});}catch(error){return res.status(500).json({message:"Failed to update HACCP log",error:error.message});}};
export const deleteHaccpLog=async(req,res)=>{try{const log=await HaccpLog.findByIdAndDelete(req.params.id);if(!log)return res.status(404).json({message:"HACCP log not found"});return res.json({message:"HACCP log deleted"});}catch(error){return res.status(500).json({message:"Failed to delete HACCP log",error:error.message});}};
