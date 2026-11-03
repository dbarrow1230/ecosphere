import mongoose from "mongoose";

const promptSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
 question:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 promptType:{type:String,enum:["daily-journal","private-journal","reflection","gratitude","mindfulness","weekly-review","monthly-review","yearly-review","goal-review","general"],default:"general"},
 section:{type:String,default:""},
 sortOrder:{type:Number,default:0},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"prompts"});

promptSchema.index({user:1,promptType:1,isActive:1});
promptSchema.index({promptType:1,isDefault:1});

const Prompt=mongoose.model("Prompt",promptSchema);

export default Prompt;