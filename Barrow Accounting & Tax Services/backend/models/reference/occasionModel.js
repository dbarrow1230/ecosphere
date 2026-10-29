import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const occasionSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Season"},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},

 startDate:{type:Date,required:true},
 endDate:{type:Date,required:true},

 isRecurringAnnual:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true,index:true},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"occasions"});

occasionSchema.index({business_id:1,name:1},{unique:true});
occasionSchema.index({business_id:1,code:1},{unique:true,sparse:true});
occasionSchema.index({business_id:1,seasonRef:1});
occasionSchema.index({business_id:1,isActive:1});

const Occasion=businessInfoConnection.models.Occasion||businessInfoConnection.model("Occasion",occasionSchema);

export default Occasion;