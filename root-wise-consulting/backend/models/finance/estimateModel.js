//backend/models/finance/estimateModel.js
import mongoose from "mongoose";

const estimateLineItemSchema=new mongoose.Schema({
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",default:null},
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 unit:{type:String,enum:["flat","hour","day","week","item","menu","session","custom"],default:"flat"},
 quantity:{type:Number,default:1,min:0},
 unitRate:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 isOptional:{type:Boolean,default:false},
 sortOrder:{type:Number,default:0}
},{_id:false});

const estimateSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 estimateNumber:{type:String,trim:true,default:""},
 version:{type:Number,default:1,min:1},
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 scopeSummary:{type:String,trim:true,default:""},
 lineItems:[estimateLineItemSchema],
 subtotal:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 taxRate:{type:Number,default:0,min:0},
 taxAmount:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 status:{type:String,enum:["draft","reviewed","approved","archived"],default:"draft"},
 estimatedStartDate:{type:Date,default:null},
 estimatedEndDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"estimates"});

estimateSchema.index({project:1});
estimateSchema.index({clientBusiness:1});
estimateSchema.index({estimateNumber:1});
estimateSchema.index({status:1});
estimateSchema.index({isActive:1});

const Estimate=mongoose.models.Estimate||mongoose.model("Estimate",estimateSchema);

export default Estimate;