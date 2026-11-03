import mongoose from "mongoose";

const noteSectionSchema=new mongoose.Schema({
 heading:{type:String,default:""},
 body:{type:String,default:""}
},{_id:false});

const noteSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 title:{type:String,required:true,trim:true},
 noteType:{type:String,enum:["general","cornell","mindmap","outline","boxing","charting","sentence","slides","brain-dump","bullet"],default:"general"},
 noteDate:{type:Date,default:Date.now},
 content:{type:String,default:""},
 sections:[noteSectionSchema],
 summary:{type:String,default:""},
 keyPoints:[{type:String,trim:true}],
 actionItems:[{type:String,trim:true}],
 lifeArea:{type:mongoose.Schema.Types.ObjectId,ref:"LifeArea"},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
 linkedGoal:{type:mongoose.Schema.Types.ObjectId,ref:"Goal"},
 linkedTask:{type:mongoose.Schema.Types.ObjectId,ref:"Task"},
 tags:[{type:mongoose.Schema.Types.ObjectId,ref:"Tag"}]
},{ timestamps:true, collection:"notes"});

noteSchema.index({user:1,noteDate:-1,noteType:1});
noteSchema.index({user:1,lifeArea:1});

const Note=mongoose.model("Note",noteSchema);

export default Note;