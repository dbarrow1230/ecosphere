import {Router} from "express";
import Service from "../models/consulting/serviceModel.js";
const router=Router();
router.get("/services",async(req,res,next)=>{try{res.json(await Service.find({isActive:true}).select("name category description scope deliverables").sort({sortOrder:1,name:1}).lean());}catch(error){next(error);}});
export default router;
