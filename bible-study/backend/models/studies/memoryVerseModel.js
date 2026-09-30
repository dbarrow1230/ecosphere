// backend/models/studies/memoryVerseModel.js
import mongoose from "mongoose";

const memoryVerseSchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",default:null},

 reference:{type:String,required:true,trim:true},
 book:{type:String,trim:true,default:""},
 chapter:{type:Number,default:null},
 verseStart:{type:Number,default:null},
 verseEnd:{type:Number,default:null},

 text:{type:String,trim:true,default:""},
 translation:{type:String,trim:true,default:""},

 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null},
 memorized:{type:Boolean,default:false},
 reviewLevel:{type:Number,default:0,min:0},

 lastReviewedAt:{type:Date,default:null},
 nextReviewAt:{type:Date,default:null},

 notes:{type:String,trim:true,default:""},
 tags:[{type:String,trim:true}]

},{ timestamps:true, collection:"memory_verses"});

export default mongoose.models.MemoryVerse||mongoose.model("MemoryVerse",memoryVerseSchema);