import mongoose from "mongoose";

const {Schema}=mongoose;

const issueNoteSchema=new Schema({
 note:{type:String,trim:true,default:""},
 date:{type:Date,default:Date.now},
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{_id:false});

const issueSchema=new Schema({
 title:{type:String,required:true,trim:true},
 issueType:{type:String,trim:true,default:""},
 severity:{type:String,trim:true,default:""},
 status:{type:String,trim:true,default:"open"},
 sourceType:{type:String,trim:true,default:""},
 seed:{type:Schema.Types.ObjectId,ref:"Seed",default:null},
 plant:{type:Schema.Types.ObjectId,ref:"Plant",default:null},
 planting:{type:Schema.Types.ObjectId,ref:"Planting",default:null},
 garden:{type:Schema.Types.ObjectId,ref:"Garden",default:null},
 observedAt:{type:Date,default:Date.now},
 resolvedAt:{type:Date,default:null},
 description:{type:String,trim:true,default:""},
 actionTaken:{type:String,trim:true,default:""},
 notes:[issueNoteSchema],
 createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"issues"});

const Issue=mongoose.models.Issue||mongoose.model("Issue",issueSchema);

export default Issue;