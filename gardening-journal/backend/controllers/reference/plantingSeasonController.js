//backend/controllers/reference/plantingSeasonController.js
import PlantingSeason from '../../models/reference/plantingSeasonModel.js';

export const getPlantingSeasons=async(req,res)=>{
 const plantingSeasons=await PlantingSeason.find({}).populate('season').sort({name:1});
 res.json(plantingSeasons);
};

export const getPlantingSeasonById=async(req,res)=>{
 const plantingSeason=await PlantingSeason.findById(req.params.id).populate('season');
 if(!plantingSeason)return res.status(404).json({message:'Planting season not found'});
 res.json(plantingSeason);
};

export const createPlantingSeason=async(req,res)=>{
 const plantingSeason=await PlantingSeason.create(req.body);
 res.status(201).json(plantingSeason);
};

export const updatePlantingSeason=async(req,res)=>{
 const plantingSeason=await PlantingSeason.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true}).populate('season');
 if(!plantingSeason)return res.status(404).json({message:'Planting season not found'});
 res.json(plantingSeason);
};

export const deletePlantingSeason=async(req,res)=>{
 const plantingSeason=await PlantingSeason.findByIdAndDelete(req.params.id);
 if(!plantingSeason)return res.status(404).json({message:'Planting season not found'});
 res.json({message:'Planting season deleted'});
};