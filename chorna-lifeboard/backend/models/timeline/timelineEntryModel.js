import mongoose from "mongoose";

const timelineEntrySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 entryDate:{type:Date,required:true},
 entryType:{type:String,enum:["task","goal","habit","journal","mindfulness","note","milestone","mood","memory","event","other"],default:"other"},
 sourceModel:{type:String,default:""},
 sourceId:{type:mongoose.Schema.Types.ObjectId},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 isPrivate:{type:Boolean,default:false},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"timeline_entries"});

timelineEntrySchema.index({user:1,entryDate:-1});
timelineEntrySchema.index({user:1,entryType:1});
timelineEntrySchema.index({user:1,isPrivate:1});

const TimelineEntry=mongoose.model("TimelineEntry",timelineEntrySchema);

export default TimelineEntry;