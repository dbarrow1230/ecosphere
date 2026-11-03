// backend/models/costing/CostModel.js
import mongoose from "mongoose";

const costModelSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,index:true},
 description:{type:String,trim:true,default:""},

 // pricing logic
 foodCostPercent:{type:Number,default:0,min:0},
 laborPercent:{type:Number,default:0,min:0},
 overheadPercent:{type:Number,default:0,min:0},
 profitPercent:{type:Number,default:0,min:0},

 // optional direct pricing fallback
 markupPercent:{type:Number,default:0,min:0},

 // optional flags
 isDefault:{type:Boolean,default:false,index:true},
 isActive:{type:Boolean,default:true,index:true},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"cost_models"});

costModelSchema.index({name:1,isActive:1});

export default mongoose.model("CostModel",costModelSchema);