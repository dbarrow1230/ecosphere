//backend\models\taxonomy\LabelModel.js
import mongoose from "mongoose";

const labelSchema=new mongoose.Schema({
 key:{type:String,required:true,trim:true},
 value:{type:String,required:true,trim:true},

 type:{type:String,enum:["status","priority","stage","menu","report","finance","custom"],default:"custom"},

 description:{type:String,trim:true,default:""},
 color:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"labels"});

labelSchema.index({key:1,type:1});
labelSchema.index({type:1});
labelSchema.index({isActive:1});

export default mongoose.models.Label||mongoose.model("Label",labelSchema);