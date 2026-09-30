import mongoose from "mongoose";

const promptResponseSchema=new mongoose.Schema({
 prompt:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
 question:{type:String,default:""},
 answer:{type:String,default:""}
},{_id:false});

const journalEntrySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,default:""},
 journalType:{type:String,enum:["daily","private","reflection","gratitude","memory","dream","free-write"],default:"daily"},
 entryDate:{type:Date,required:true},
 content:{type:String,default:""},
 activities:[{type:String,trim:true}],
 mood:{type:String,default:""},
 energy:{type:Number,min:1,max:10},
 weather:{type:String,default:""},
 location:{type:String,default:""},
 highlights:[{type:String,trim:true}],
 challenges:[{type:String,trim:true}],
 gratitude:[{type:String,trim:true}],
 lessons:[{type:String,trim:true}],
 nextSteps:[{type:String,trim:true}],
 prompt:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
 promptResponses:[promptResponseSchema],
 isPrivate:{type:Boolean,default:false},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedGoals:[{type:mongoose.Schema.Types.ObjectId,ref:"Goal"}],
 linkedHabits:[{type:mongoose.Schema.Types.ObjectId,ref:"Habit"}],
 linkedTasks:[{type:mongoose.Schema.Types.ObjectId,ref:"Task"}],
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"journal_entries"});

journalEntrySchema.index({user:1,entryDate:-1,journalType:1});
journalEntrySchema.index({user:1,isPrivate:1});
journalEntrySchema.index({user:1,lifeArea:1});

const JournalEntry=mongoose.model("JournalEntry",journalEntrySchema);

export default JournalEntry;