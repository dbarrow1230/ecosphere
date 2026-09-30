// backend/controllers/beverages/beverageTastingController.js
import BeverageTasting from "../../models/beverages/beverageTastingModel.js";
export const createBeverageTasting=async(req,res)=>{
    try{
        const tasting=await BeverageTasting.create(req.body);
        res.status(201).json(tasting);
    }catch(error){
        res.status(400).json({message:error.message});
    }
};
export const getBeverageTastings=async(req,res)=>{
    try{
        const filter=req.query.userId?{userId:req.query.userId}:{};
        const tastings=await BeverageTasting.find(filter).sort({tastingDate:-1});
        res.status(200).json(tastings);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
export const getBeverageTastingById=async(req,res)=>{
    try{
        const tasting=await BeverageTasting.findById(req.params.id);
        if(!tasting) return res.status(404).json({message:"Beverage tasting not found"});
        res.status(200).json(tasting);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};
export const updateBeverageTasting=async(req,res)=>{
    try{
        const tasting=await BeverageTasting.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});
        if(!tasting) return res.status(404).json({message:"Beverage tasting not found"});
        res.status(200).json(tasting);
    }catch(error){
        res.status(400).json({message:error.message});
    }
};
export const deleteBeverageTasting=async(req,res)=>{
    try{
        const tasting=await BeverageTasting.findByIdAndDelete(req.params.id);
        if(!tasting) return res.status(404).json({message:"Beverage tasting not found"});
        res.status(200).json({message:"Beverage tasting deleted"});
    }catch(error){
        res.status(500).json({message:error.message});
    }
};