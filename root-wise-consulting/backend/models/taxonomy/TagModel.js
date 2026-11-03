//backend\models\taxonomy\TagModel.js
import mongoose from "mongoose";

const tagSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 slug:{type:String,trim:true,lowercase:true,default:""},
 type:{type:String,enum:["menu","project","content","inventory","reporting","finance","general"],default:"general"},

 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"tags"});

tagSchema.index({name:1,type:1});
tagSchema.index({slug:1});
tagSchema.index({isActive:1});

export default mongoose.models.Tag||mongoose.model("Tag",tagSchema);