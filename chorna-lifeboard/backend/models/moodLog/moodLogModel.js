import mongoose from "mongoose";

const moodLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 logDate:{type:Date,required:true},
 mood:{type:String,required:true,trim:true},
 energy:{type:Number,min:1,max:10},
 stress:{type:Number,min:1,max:10},
 notes:{type:String,default:""},
 sourceType:{type:String,enum:["manual","journal","mindfulness"],default:"manual"},
 journalEntry:{type:mongoose.Schema.Types.ObjectId,ref:"JournalEntry"},
 mindfulnessEntry:{type:mongoose.Schema.Types.ObjectId,ref:"MindfulnessEntry"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"mood_logs"
});

moodLogSchema.index({user:1,logDate:-1});
moodLogSchema.index({user:1,mood:1});

const MoodLog=mongoose.model("MoodLog",moodLogSchema);

export default MoodLog;