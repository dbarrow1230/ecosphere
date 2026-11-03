import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 symbol:{type:String,required:true,trim:true},
 description:{type:String,default:"",trim:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"unit_of_measures"});

export default mongoose.models.UnitOfMeasure||mongoose.model("UnitOfMeasure",schema);
