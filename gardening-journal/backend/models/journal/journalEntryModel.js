// backend/models/journal/journalEntryModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const journalEntrySchema=new Schema({
dailyJournal:{type:Schema.Types.ObjectId,ref:"DailyJournal",default:null},
planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
gardenSection:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
hydroSystem:{type:Schema.Types.ObjectId,ref:"HydroSystem",default:null},
hydroDevice:{type:Schema.Types.ObjectId,default:null},
hydroPodPosition:{type:Number,default:null},
equipment:{type:Schema.Types.ObjectId,ref:"Equipment",default:null},
title:{type:String,trim:true,default:""},
entry:{type:String,trim:true,default:""},
entryDate:{type:Date,default:Date.now},
entryType:{type:String,trim:true,enum:["note","maintenance","observation","watering","feeding","pruning","harvest","transplant","pest","disease","hydro-refill","hydro-cleaning","equipment","other"],default:"note"},
maintenanceType:{type:String,trim:true,default:""},
outcome:{type:String,trim:true,enum:["","planned","completed","partial","needs-follow-up","failed","resolved"],default:""},
durationMinutes:{type:Number,default:0,min:0},
followUpDate:{type:Date,default:null},
mood:{type:String,trim:true,default:""},
tags:[String],
notes:[noteSchema],
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"journal_entries"});

const JournalEntry=mongoose.models.JournalEntry||mongoose.model("JournalEntry",journalEntrySchema,);

export default JournalEntry;
