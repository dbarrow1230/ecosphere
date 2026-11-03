// backend/models/pricing/containerTypeModel.js
import mongoose from "mongoose";

const containerTypeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true}, // jar, can, bag, bottle, vacuum bag
 code:{type:String,trim:true,default:"",unique:true,sparse:true},

 category:{type:String,trim:true,default:""}, // glass, metal, plastic, flexible

 size:{
  value:{type:Number,default:0}, // 16, 32, 10
  unit:{type:String,trim:true,default:""} // oz, lb, ml, L
 },

 description:{type:String,trim:true,default:""},

 isReusable:{type:Boolean,default:false},
 isFoodSafe:{type:Boolean,default:true},

 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"container_types"});

const ContainerType=mongoose.models.ContainerType||mongoose.model("ContainerType",containerTypeSchema);

export default ContainerType;