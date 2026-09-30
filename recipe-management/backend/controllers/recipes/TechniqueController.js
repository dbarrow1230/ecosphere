import Technique from "../../models/recipes/TechniqueModel.js";

export const getTechniques=async(req,res)=>{
 try{const filter={};if(req.query.isActive!==undefined)filter.isActive=req.query.isActive==="true";return res.json(await Technique.find(filter).sort({name:1}));}
 catch(error){return res.status(500).json({message:"Failed to fetch techniques",error:error.message});}
};

export const createTechnique=async(req,res)=>{
 try{const technique=await Technique.create(req.body);return res.status(201).json({message:"Technique created successfully",technique});}
 catch(error){if(error.code===11000)return res.status(409).json({message:"Technique already exists"});return res.status(500).json({message:"Failed to create technique",error:error.message});}
};

export const updateTechnique=async(req,res)=>{
 try{const technique=await Technique.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});if(!technique)return res.status(404).json({message:"Technique not found"});return res.json({message:"Technique updated successfully",technique});}
 catch(error){return res.status(500).json({message:"Failed to update technique",error:error.message});}
};

export const deleteTechnique=async(req,res)=>{
 try{const technique=await Technique.findByIdAndDelete(req.params.id);if(!technique)return res.status(404).json({message:"Technique not found"});return res.json({message:"Technique deleted successfully"});}
 catch(error){return res.status(500).json({message:"Failed to delete technique",error:error.message});}
};
