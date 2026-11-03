// backend/models/reference/partsModel.js
import mongoose from "mongoose";

const partSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,unique:true,sparse:true},
 description:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]},
 image:{type:[String],default:[]},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",required:true}
},{timestamps:true,collection:"parts"});

partSchema.index({name:1});
partSchema.index({status:1});

export default mongoose.models.Part||mongoose.model("Part",partSchema);