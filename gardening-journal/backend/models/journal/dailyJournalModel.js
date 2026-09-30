// backend/models/journal/dailyJournalModel.js
import mongoose from "mongoose";
const {Schema,model}=mongoose;

const noteSchema=new Schema({note:{type:String,trim:true,default:""},date:{type:Date,default:Date.now},createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}},{_id:false});

const dailyJournalSchema=new Schema({
journalDate:{type:Date,default:Date.now},
garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
gardenSection:{type:Schema.Types.ObjectId,ref:"GardenSection",default:null},
planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
hydroSystem:{type:Schema.Types.ObjectId,ref:"HydroSystem",default:null},
equipment:{type:Schema.Types.ObjectId,ref:"Equipment",default:null},
weatherObservation:{type:Schema.Types.ObjectId,ref:"WeatherObservation",default:null},
summary:{type:String,trim:true,default:""},
notes:[noteSchema],
entries:[{type:Schema.Types.ObjectId,ref:"JournalEntry"}],
observations:[{type:Schema.Types.ObjectId,ref:"Observation"}],
activities:[{type:Schema.Types.ObjectId,ref:"Activity"}],
images:[String],
createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"daily_journals"});

const DailyJournal=mongoose.models.DailyJournal||mongoose.model("DailyJournal",dailyJournalSchema,);

export default DailyJournal;
