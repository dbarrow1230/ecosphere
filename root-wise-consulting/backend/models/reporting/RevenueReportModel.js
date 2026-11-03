//backend\models\reporting\RevenueReportModel.js
import mongoose from "mongoose";

const revenueBreakdownSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 amount:{type:Number,default:0,min:0},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const revenueReportSchema=new mongoose.Schema({
 report:{type:mongoose.Schema.Types.ObjectId,ref:"Report",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 periodStart:{type:Date,default:null},
 periodEnd:{type:Date,default:null},
 reportDate:{type:Date,default:Date.now},

 invoicedAmount:{type:Number,default:0,min:0},
 paidAmount:{type:Number,default:0,min:0},
 outstandingAmount:{type:Number,default:0,min:0},
 expenseAmount:{type:Number,default:0,min:0},
 netAmount:{type:Number,default:0,min:0},

 breakdown:[revenueBreakdownSchema],
 summary:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"revenue_reports"});

revenueReportSchema.index({report:1});
revenueReportSchema.index({clientBusiness:1});
revenueReportSchema.index({project:1});
revenueReportSchema.index({periodStart:1,periodEnd:1});
revenueReportSchema.index({reportDate:1});
revenueReportSchema.index({isActive:1});

export default mongoose.models.RevenueReport||mongoose.model("RevenueReport",revenueReportSchema);