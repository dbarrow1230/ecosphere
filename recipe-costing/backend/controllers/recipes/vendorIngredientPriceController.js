import VendorIngredientPrice from "../../models/recipes/VendorIngredientPriceModel.js";
import {createReferenceCrudController} from "./referenceCrudController.js";

const controller=createReferenceCrudController(VendorIngredientPrice,"Vendor ingredient price");

controller.getAll=async(req,res)=>{
 try{
  const query={};
  if(req.query.business)query.business=req.query.business;
  if(req.query.vendor)query.vendor=req.query.vendor;
  if(req.query.ingredient)query.ingredient=req.query.ingredient;
  if(req.query.isActive==="true")query.isActive=true;
  if(req.query.isActive==="false")query.isActive=false;

  const rows=await VendorIngredientPrice.find(query)
   .populate("business vendor ingredient imperialUnit metricUnit")
   .sort({isPreferred:-1,effectiveDate:-1})
   .lean();

  res.status(200).json(rows);
 }catch(error){
  res.status(500).json({message:"Failed to load vendor ingredient prices",error:error.message});
 }
};

export default controller;
