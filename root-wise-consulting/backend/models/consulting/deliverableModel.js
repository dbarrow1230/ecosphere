//backend/models/consulting/deliverableModel.js
import mongoose from "mongoose";

const deliverableSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 proposal:{type:mongoose.Schema.Types.ObjectId,ref:"Proposal",default:null},
 title:{type:String,required:true,trim:true},
 deliverableType:{type:String,enum:["menu","report","assessment","recipe-pack","costing-sheet","opening-plan","training","other"],default:"other"},
 version:{type:Number,default:1,min:1},
 description:{type:String,trim:true,default:""},
 fileName:{type:String,trim:true,default:""},
 fileUrl:{type:String,trim:true,default:""},
 deliveryDate:{type:Date,default:null},
 approvedDate:{type:Date,default:null},
 clientVisible:{type:Boolean,default:true},
 status:{type:String,enum:["draft","in-progress","delivered","approved","revised"],default:"draft"},
 revisionNotes:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"deliverables"});

deliverableSchema.index({project:1});
deliverableSchema.index({proposal:1});
deliverableSchema.index({deliverableType:1});
deliverableSchema.index({status:1});
deliverableSchema.index({isActive:1});

const Deliverable=mongoose.models.Deliverable||mongoose.model("Deliverable",deliverableSchema);

export default Deliverable;