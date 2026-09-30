import mongoose from "mongoose";

const mindfulnessPromptSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 question:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 mindfulnessType:{type:String,enum:["check-in","gratitude","breathing","body-scan","stress","intention","reflection","grounding","general"],default:"general"},
 section:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"mindfulness_prompts"});

mindfulnessPromptSchema.index({user:1,mindfulnessType:1,isActive:1});
mindfulnessPromptSchema.index({mindfulnessType:1,isDefault:1});

const MindfulnessPrompt=mongoose.model("MindfulnessPrompt",mindfulnessPromptSchema);

export default MindfulnessPrompt;