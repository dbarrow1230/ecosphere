// backend/models/reference/formsModel.js
import mongoose from "mongoose";

const formSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 image:{type:[String],default:[]},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",required:true}
},{timestamps:true,collection:"forms"});

formSchema.index({name:1});
formSchema.index({status:1});

export default mongoose.models.Form||mongoose.model("Form",formSchema);