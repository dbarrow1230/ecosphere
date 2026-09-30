import mongoose from "mongoose";

const musicNoteSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,trim:true,default:""},content:{type:String,trim:true,required:true},
 projectIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicProject"}],default:[]},
 chordIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordIdea"}],default:[]},
 progressionIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordProgression"}],default:[]},
 lyricIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"LyricIdea"}],default:[]},
 arrangementIdeaIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ArrangementIdea"}],default:[]},
 relatedNoteIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicNote"}],default:[]},
 tags:{type:[String],default:[]}
},{timestamps:true,collection:"music_notes"});

musicNoteSchema.index({userId:1});
musicNoteSchema.index({projectIds:1});

const MusicNote=mongoose.models.MusicNote||mongoose.model("MusicNote",musicNoteSchema);
export default MusicNote;
