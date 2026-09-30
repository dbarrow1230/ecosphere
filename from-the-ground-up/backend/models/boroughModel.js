import mongoose from "mongoose";

const boroughSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,unique:true},
 slug:{type:String,trim:true,lowercase:true,unique:true},
 code:{type:String,trim:true,uppercase:true},
 active:{type:Boolean,default:true}
},{timestamps:true,collection:"boroughs"});

const Borough=mongoose.model("Borough",boroughSchema);
export default Borough;