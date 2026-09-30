import mongoose from "mongoose";

const promptResponseSchema=new mongoose.Schema({
 prompt:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
 question:{type:String,default:""},
 answer:{type:String,default:""}
},{_id:false});

const mindfulnessEntrySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 entryDate:{type:Date,required:true},
 mood:{type:String,default:""},
 energy:{type:Number,min:1,max:10},
 stress:{type:Number,min:1,max:10},
 gratitude:[{type:String,trim:true}],
 intention:{type:String,default:""},
 affirmation:{type:String,default:""},
 reflection:{type:String,default:""},
 bodyFeeling:{type:String,default:""},
 mentalState:{type:String,default:""},
 needs:{type:String,default:""},
 prompt:{type:mongoose.Schema.Types.ObjectId,ref:"Prompt"},
 promptResponses:[promptResponseSchema],
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"mindfulness_entries"});

mindfulnessEntrySchema.index({user:1,entryDate:-1});
mindfulnessEntrySchema.index({user:1,mood:1});

const MindfulnessEntry=mongoose.model("MindfulnessEntry",mindfulnessEntrySchema);

export default MindfulnessEntry;