import mongoose from "mongoose";

const memorySchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 description:{type:String,default:""},
 memoryDate:{type:Date,required:true},
 memoryType:{type:String,enum:["personal","family","friendship","relationship","career","creative","travel","health","achievement","lesson","loss","other"],default:"personal"},
 content:{type:String,default:""},
 location:{type:String,default:""},
 people:[{type:String,trim:true}],
 mood:{type:String,default:""},
 isPrivate:{type:Boolean,default:true},
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedJournalEntry:{type:mongoose.Schema.Types.ObjectId,ref:"JournalEntry"},
 linkedTimelineEntry:{type:mongoose.Schema.Types.ObjectId,ref:"TimelineEntry"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"memories"});

memorySchema.index({user:1,memoryDate:-1});
memorySchema.index({user:1,memoryType:1});
memorySchema.index({user:1,isPrivate:1});

const Memory=mongoose.model("Memory",memorySchema);

export default Memory;