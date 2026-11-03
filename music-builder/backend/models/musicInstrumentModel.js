import mongoose from "mongoose";

const musicInstrumentSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"music_instruments"});

const MusicInstrument=mongoose.models.MusicInstrument||mongoose.model("MusicInstrument",musicInstrumentSchema);
export default MusicInstrument;
