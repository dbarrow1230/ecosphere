//backend\models\locations\LocationModel.js
import mongoose from "mongoose";

const locationSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,default:""},
 type:{type:String,enum:["kitchen","storage","prep","service","office","other"],default:"other"},

 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 parentLocation:{type:mongoose.Schema.Types.ObjectId,ref:"Location",default:null},

 description:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"locations"});

locationSchema.index({name:1});
locationSchema.index({type:1});
locationSchema.index({clientBusiness:1});
locationSchema.index({project:1});
locationSchema.index({parentLocation:1});

export default mongoose.models.Location||mongoose.model("Location",locationSchema);