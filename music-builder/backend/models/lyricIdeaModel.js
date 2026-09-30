import mongoose from "mongoose";

const lyricIdeaSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,trim:true,default:""},content:{type:String,trim:true,required:true},notes:{type:String,trim:true,default:""},
 projectIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicProject"}],default:[]},
 chordIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordIdea"}],default:[]},
 progressionIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordProgression"}],default:[]},
 relatedLyricIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"LyricIdea"}],default:[]},
 tags:{type:[String],default:[]}
},{timestamps:true,collection:"lyric_ideas"});

lyricIdeaSchema.index({userId:1});
lyricIdeaSchema.index({projectIds:1});

const LyricIdea=mongoose.models.LyricIdea||mongoose.model("LyricIdea",lyricIdeaSchema);
export default LyricIdea;
