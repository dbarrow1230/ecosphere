import mongoose from "mongoose";

const chordInversionSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true},
 sortOrder:{type:Number,default:0},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"chord_inversions"});

const ChordInversion=mongoose.models.ChordInversion||mongoose.model("ChordInversion",chordInversionSchema);
export default ChordInversion;
