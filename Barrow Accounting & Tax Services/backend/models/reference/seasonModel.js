//backend/models/reference/seasonsModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const seasonSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 description:{type:String,trim:true,default:""},
 startDate:{type:Date,required:true},
 endDate:{type:Date,required:true},

 isRecurringAnnual:{type:Boolean,default:false},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"seasons"});

seasonSchema.index({business_id:1,name:1},{unique:true});
seasonSchema.index({business_id:1,code:1},{unique:true,sparse:true});
seasonSchema.index({business_id:1,startDate:1,endDate:1});
seasonSchema.index({business_id:1,isDefault:1});
seasonSchema.index({business_id:1,isActive:1});

const Season=businessInfoConnection.models.Season||businessInfoConnection.model("Season",seasonSchema);

export default Season;
