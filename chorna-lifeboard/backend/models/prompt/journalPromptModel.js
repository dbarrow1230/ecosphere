import mongoose from "mongoose";

const journalPromptSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 question:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 journalType:{type:String,enum:["daily","private","reflection","gratitude","memory","dream","free-write"],default:"daily"},
 section:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"journal_prompts"});

journalPromptSchema.index({user:1,journalType:1,isActive:1});
journalPromptSchema.index({journalType:1,isDefault:1});

const JournalPrompt=mongoose.model("JournalPrompt",journalPromptSchema);

export default JournalPrompt;