import mongoose from "mongoose";

const chordIdeaSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,trim:true,default:""},chord:{type:String,trim:true,required:true},
 key:{type:String,trim:true,default:""},voicing:{type:String,trim:true,default:""},
 inversionId:{type:mongoose.Schema.Types.ObjectId,ref:"ChordInversion",default:null},
 instrumentId:{type:mongoose.Schema.Types.ObjectId,ref:"MusicInstrument",default:null},
 musicNoteIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicNote"}],default:[]},
 projectIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"MusicProject"}],default:[]},
 relatedChordIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordIdea"}],default:[]},
 relatedProgressionIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"ChordProgression"}],default:[]},
 tags:{type:[String],default:[]}
},{timestamps:true,collection:"chord_ideas"});

chordIdeaSchema.index({userId:1});
chordIdeaSchema.index({projectIds:1});
chordIdeaSchema.index({instrumentId:1});
chordIdeaSchema.index({inversionId:1});

const ChordIdea=mongoose.models.ChordIdea||mongoose.model("ChordIdea",chordIdeaSchema);
export default ChordIdea;
