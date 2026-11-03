// backend/models/studies/libraryItemModel.js
import mongoose from "mongoose";

const libraryItemSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",default:null},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},

 title:{type:String,required:true,trim:true},
 subtitle:{type:String,trim:true,default:""},
 type:{type:mongoose.Schema.Types.ObjectId,ref:"LibraryItemType",default:null},

 reference:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},
 source:{type:String,trim:true,default:""},

 category:{type:mongoose.Schema.Types.ObjectId,ref:"StudyCategory",default:null},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},

 tags:[{type:String,trim:true}],
 notes:[{type:String,trim:true}],

 featured:{type:Boolean,default:false},
 active:{type:Boolean,default:true}

},{ timestamps:true, collection:"library_items"});

export default mongoose.models.LibraryItem||mongoose.model("LibraryItem",libraryItemSchema);