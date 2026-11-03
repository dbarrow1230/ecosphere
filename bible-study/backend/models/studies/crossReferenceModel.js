// backend/models/studies/crossReferenceModel.js
import mongoose from "mongoose";

const crossReferenceSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",default:null},

 fromReference:{type:String,required:true,trim:true},
 toReference:{type:String,required:true,trim:true},

 theme:{type:mongoose.Schema.Types.ObjectId,ref:"StudyCategory",default:null},
 note:{type:String,trim:true,default:""},
 strength:{type:Number,default:0,min:0,max:100},

 tags:[{type:String,trim:true}],
 active:{type:Boolean,default:true}

},{ timestamps:true, collection:"cross_references"});

export default mongoose.models.CrossReference||mongoose.model("CrossReference",crossReferenceSchema);