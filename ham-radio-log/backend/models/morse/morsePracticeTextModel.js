// backend/models/morse/morsePracticeTextModel.js
import mongoose from "mongoose";

const morsePracticeTextModel=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

 title:{type:String,trim:true,default:"Untitled Practice Text"},

 sourceType:{type:String,enum:["generated","pasted","uploaded","custom"],default:"generated"},
 practiceType:{type:String,enum:["letters","numbers","mixed","words","qcodes","callsigns","qso","custom"],default:"letters"},

 level:{type:Number,default:1},
 startingWpm:{type:Number,default:5},
 incrementBy:{type:Number,default:5},

 text:{type:String,trim:true,required:true},
 parsedText:{type:String,trim:true,default:""},

 unsupportedCharacters:[{type:String,trim:true}],

 wordCount:{type:Number,default:0},
 characterCount:{type:Number,default:0},

 notes:{type:String,trim:true,default:""},
 tags:[{type:String,trim:true}],

 isFavorite:{type:Boolean,default:false},
 isArchived:{type:Boolean,default:false}
},{timestamps:true,collection:"morse_practice_texts"});

const MorsePracticeText=mongoose.model("MorsePracticeText",morsePracticeTextModel);

export default MorsePracticeText;