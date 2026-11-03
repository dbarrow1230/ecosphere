import express from "express";
import mongoose from "mongoose";
import {list,library,create,update,remove} from "../../controllers/planning/companionPlantingController.js";

const router=express.Router();
router.param("id",(req,res,next,id)=>mongoose.isValidObjectId(id)?next():res.status(400).json({message:"Invalid record id"}));
router.get("/library",library);
router.get("/",list);
router.post("/",create);
router.put("/:id",update);
router.delete("/:id",remove);
export default router;
