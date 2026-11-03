//backend/models/consulting/projectNoteModel.js
import mongoose from "mongoose";

const projectNoteSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 noteType:{type:String,enum:["general","call","meeting","observation","decision","follow-up"],default:"general"},
 title:{type:String,trim:true,default:""},
 note:{type:String,required:true,trim:true},
 followUpDate:{type:Date,default:null},
 isPinned:{type:Boolean,default:false},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"project_notes"});

projectNoteSchema.index({project:1});
projectNoteSchema.index({noteType:1});
projectNoteSchema.index({followUpDate:1});
projectNoteSchema.index({isPinned:1});

const ProjectNote=mongoose.models.ProjectNote||mongoose.model("ProjectNote",projectNoteSchema);

export default ProjectNote;