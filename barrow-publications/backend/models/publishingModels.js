import mongoose from "mongoose";
import {workflowStatuses,referenceSections,referenceStatuses} from "../../src/data/publishingSchema.js";
const {Schema}=mongoose;
const recordSchema=new Schema({
 title:{type:String,required:true,trim:true,maxlength:300},
 bookId:{type:Schema.Types.ObjectId,default:null,index:true},
 author:{type:String,trim:true,default:""},
 owner:{type:String,trim:true,default:""},
 ownerId:{type:Schema.Types.ObjectId,default:null},
 module:{type:String,required:true},workflow:{type:String,required:true},
 status:{type:String,enum:workflowStatuses,default:"not-started"},
 dueDate:{type:Date,default:null},
 publisher:{type:Schema.Types.ObjectId,default:null},
 genres:[Schema.Types.ObjectId],categories:[Schema.Types.ObjectId],
 notes:{type:String,default:"",maxlength:30000},
 details:{type:Schema.Types.Mixed,default:()=>({})},
 history:[{stage:String,status:String,at:Date,by:Schema.Types.ObjectId}],
 createdBy:{type:Schema.Types.ObjectId,required:true}
},{timestamps:true,optimisticConcurrency:true,collection:"publishing_workflow_records"});
recordSchema.index({module:1,workflow:1,status:1});
const referenceSchema=new Schema({
 section:{type:String,enum:referenceSections,required:true},
 title:{type:String,required:true,trim:true,maxlength:300},
 content:{type:String,required:true,maxlength:50000},
 sourceUrl:{type:String,default:""},
 status:{type:String,enum:referenceStatuses,default:"draft"},
 createdBy:{type:Schema.Types.ObjectId,required:true}
},{timestamps:true,optimisticConcurrency:true,collection:"publishing_references"});
export const PublishingRecord=mongoose.models.PublishingRecord||mongoose.model("PublishingRecord",recordSchema);
export const PublishingReference=mongoose.models.PublishingReference||mongoose.model("PublishingReference",referenceSchema);
