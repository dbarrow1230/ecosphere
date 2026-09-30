import mongoose from "mongoose";

const arrangementIdeaSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,trim:true,default:""},content:{type:String,trim:true,required:true},notes:{type:String,trim:true,default:""},
 projectIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicProject"}],default:[]},
 chordIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordIdea"}],default:[]},
 progressionIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordProgression"}],default:[]},
 lyricIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"LyricIdea"}],default:[]},
 relatedArrangementIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ArrangementIdea"}],default:[]},
 tags:{type:[String],default:[]}
},{timestamps:true,collection:"arrangement_ideas"});

arrangementIdeaSchema.index({userId:1});
arrangementIdeaSchema.index({projectIds:1});

const ArrangementIdea=mongoose.models.ArrangementIdea||mongoose.model("ArrangementIdea",arrangementIdeaSchema);
export default ArrangementIdea;
