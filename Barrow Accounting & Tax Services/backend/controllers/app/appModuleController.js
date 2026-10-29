// backend/controllers/app/appModuleController.js
import AppKey from "../../models/reference/appKeyModel.js";
import {getAppModules} from "../../utils/getAppModules.js";

export const getModulesByAppKey=async(req,res,next)=>{
 try{
  const {appKeyId}=req.params;

  if(!appKeyId)
   return res.status(400).json({message:"appKeyId is required"});

  const appKeyRecord=await AppKey.findById(appKeyId).select("name appKey");
  if(!appKeyRecord)
   return res.status(404).json({message:"App key record not found"});

  if(!appKeyRecord.appKey)
   return res.status(400).json({message:`App key record "${appKeyRecord.name}" is missing appKey`});

  const modules=getAppModules(appKeyRecord.appKey);

  return res.status(200).json(modules);
 }catch(error){
  return next(error);
 }
};