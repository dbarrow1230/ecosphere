// backend/models/studies/dailyNoteModel.js
import mongoose from "mongoose";

const dailyNoteEntryNoteSchema=new mongoose.Schema({
 text:{type:String,trim:true,default:""},
 notedAt:{type:Date,default:Date.now}
},{_id:true});

const dailyNoteEntrySchema=new mongoose.Schema({
 reference:{type:String,trim:true,default:""},
 translation:{type:String,trim:true,default:""},
 book:{type:String,trim:true,default:""},
 chapterStart:{type:Number,default:null},
 chapterEnd:{type:Number,default:null},
 verseStart:{type:Number,default:null},
 verseEnd:{type:Number,default:null},
 passageText:{type:String,trim:true,default:""},
 note:{type:String,trim:true,default:""},
 notes:[dailyNoteEntryNoteSchema],
 tags:[{type:String,trim:true}],
 memorize:{type:Boolean,default:false},
 memorizationStatus:{
  type:String,
  enum:["memorize","in process","reviewed"],
  default:"memorize"
 }
},{_id:true});

const dailyNoteSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 journalDate:{type:Date,required:true},
 title:{type:String,trim:true,default:""},
 summary:{type:String,trim:true,default:""},
 entries:[dailyNoteEntrySchema]
},{timestamps:true,collection:"daily_notes"});

export default mongoose.models.DailyNote||mongoose.model("DailyNote",dailyNoteSchema);
