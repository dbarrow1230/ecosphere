import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const timeOffRequestSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},

 timeOffType:{type:mongoose.Schema.Types.ObjectId,ref:"TimeOffType",default:null,index:true},
 type:{type:String,enum:["vacation","sick","personal","unpaid","holiday","other"],default:"other"},

 startDate:{type:Date,required:true},
 endDate:{type:Date,required:true},

 isPartialDay:{type:Boolean,default:false},
 partialDayStart:{type:String,trim:true,default:""},
 partialDayEnd:{type:String,trim:true,default:""},

 reason:{type:String,trim:true,default:""},
 status:{type:String,enum:["pending","approved","denied","cancelled"],default:"pending"},

 reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null},
 reviewedAt:{type:Date,default:null},
 reviewNote:{type:String,trim:true,default:""},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"time_off_requests"});

timeOffRequestSchema.index({business:1,employee:1,startDate:1,endDate:1});
timeOffRequestSchema.index({business:1,status:1,startDate:1});
timeOffRequestSchema.index({business:1,timeOffType:1});
timeOffRequestSchema.index({business:1,department:1,status:1});

const TimeOffRequest=mongoose.models.TimeOffRequest||mongoose.model("TimeOffRequest",timeOffRequestSchema);

export default TimeOffRequest;