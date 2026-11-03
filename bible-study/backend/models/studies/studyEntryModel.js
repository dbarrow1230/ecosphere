// backend/models/studies/studyEntryModel.js
import mongoose from "mongoose";

const studyEntrySchema=new mongoose.Schema({

 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 study:{type:mongoose.Schema.Types.ObjectId,ref:"Study",required:true},
 method:{type:mongoose.Schema.Types.ObjectId,ref:"BibleStudyMethod",default:null},

 entryType:{type:mongoose.Schema.Types.ObjectId,ref:"StudyEntryType",required:true},

 title:{type:String,trim:true,default:""},
 scripture:{type:String,trim:true,default:""},
 content:{type:String,trim:true,default:""},
 detail:{type:String,trim:true,default:""},

 tags:[{type:String,trim:true}],
 keywords:[{type:String,trim:true}],

 isImportant:{type:Boolean,default:false},
 isPinned:{type:Boolean,default:false},
 status:{type:mongoose.Schema.Types.ObjectId,ref:"Status",default:null}

},{ timestamps:true, collection:"study_entries"});

export default mongoose.models.StudyEntry||mongoose.model("StudyEntry",studyEntrySchema);