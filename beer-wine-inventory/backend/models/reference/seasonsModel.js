//backend/models/reference/seasonsModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const seasonSchema=new mongoose.Schema({
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

seasonSchema.index({name:1},{unique:true});
seasonSchema.index({code:1},{unique:true,sparse:true});
seasonSchema.index({startDate:1,endDate:1});
seasonSchema.index({isDefault:1});
seasonSchema.index({isActive:1});

const Season=businessInfoConnection.models.Season||businessInfoConnection.model("Season",seasonSchema);

export default Season;