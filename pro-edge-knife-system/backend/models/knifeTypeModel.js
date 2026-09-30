import mongoose from "mongoose";

const knifeTypeSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 code:{type:String,required:true,trim:true,uppercase:true,unique:true},
 category:{type:String,enum:["standard","specialty","accessory"],default:"standard"},
 description:{type:String,trim:true,default:""},
 defaultBladeLength:{type:Number,min:0,default:0},
 defaultBladeSteel:{type:String,trim:true,default:""},
 defaultEdgeAngle:{type:Number,min:0,max:90,default:15},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"knife_types"});

export default mongoose.models.KnifeType||mongoose.model("KnifeType",knifeTypeSchema);
