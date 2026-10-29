// backend/models/reference/LocationModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const LocationSchema=new Schema({
 business:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},

 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:null},
 type:{type:Schema.Types.ObjectId,ref:"LocationType",required:true},
 description:{type:String,trim:true,default:""},
 parentLocation:{type:Schema.Types.ObjectId,ref:"Location",default:null},

 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"locations"});

LocationSchema.index({business:1,name:1},{unique:true});
LocationSchema.index({business:1,code:1},{unique:true,sparse:true});

export default businessInfoConnection.models.Location||
 businessInfoConnection.model("Location",LocationSchema);