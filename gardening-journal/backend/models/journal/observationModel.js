// backend/models/journal/observationModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const observationSchema=new Schema({
dailyJournal:{type:Schema.Types.ObjectId,ref:"DailyJournal",default:null},
journalEntry:{type:Schema.Types.ObjectId,ref:"JournalEntry",default:null},
planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
gardenSection:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
name:{type:String,trim:true,default:""},
observationType:{type:String,trim:true,default:""},
observedAt:{type:Date,default:Date.now},
details:{type:String,trim:true,default:""},
tags:[String],
notes:[noteSchema],
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"observations"});
const Observation=mongoose.models.Observation||mongoose.model("Observation",observationSchema);
export default Observation;