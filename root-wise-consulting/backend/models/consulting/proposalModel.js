//backend/models/consulting/proposalModel.js
import mongoose from "mongoose";

const proposalLineItemSchema=new mongoose.Schema({
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",default:null},
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 quantity:{type:Number,default:1,min:0},
 unitPrice:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0}
},{_id:false});

const proposalSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 proposalNumber:{type:String,trim:true,default:""},
 version:{type:Number,default:1,min:1},
 title:{type:String,required:true,trim:true},
 scope:{type:String,trim:true,default:""},
 deliverables:[{type:String,trim:true}],
 assumptions:[{type:String,trim:true}],
 lineItems:[proposalLineItemSchema],
 subtotal:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 paymentTerms:{type:String,trim:true,default:""},
 depositRequired:{type:Number,default:0,min:0},
 validUntil:{type:Date,default:null},
 status:{type:String,enum:["draft","sent","accepted","rejected","expired"],default:"draft"},
 sentAt:{type:Date,default:null},
 acceptedAt:{type:Date,default:null},
 rejectedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"proposals"});

proposalSchema.index({project:1});
proposalSchema.index({proposalNumber:1});
proposalSchema.index({version:1});
proposalSchema.index({status:1});
proposalSchema.index({isActive:1});

const Proposal=mongoose.models.Proposal||mongoose.model("Proposal",proposalSchema);

export default Proposal;