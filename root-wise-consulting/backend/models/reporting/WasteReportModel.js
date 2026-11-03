//backend\models\reporting\WasteReportModel.js
import mongoose from "mongoose";

const wasteBreakdownSchema=new mongoose.Schema({
 category:{type:String,trim:true,default:""},
 itemName:{type:String,trim:true,default:""},
 quantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 estimatedCost:{type:Number,default:0,min:0},
 reason:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const wasteReportSchema=new mongoose.Schema({
 report:{type:mongoose.Schema.Types.ObjectId,ref:"Report",default:null},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 periodStart:{type:Date,default:null},
 periodEnd:{type:Date,default:null},
 reportDate:{type:Date,default:Date.now},

 totalWasteCost:{type:Number,default:0,min:0},
 totalWasteQuantity:{type:Number,default:0,min:0},

 topReasons:[{type:String,trim:true}],
 breakdown:[wasteBreakdownSchema],
 summary:{type:String,trim:true,default:""},
 recommendations:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"waste_reports"});

wasteReportSchema.index({report:1});
wasteReportSchema.index({clientBusiness:1});
wasteReportSchema.index({project:1});
wasteReportSchema.index({periodStart:1,periodEnd:1});
wasteReportSchema.index({reportDate:1});
wasteReportSchema.index({isActive:1});

export default mongoose.models.WasteReport||mongoose.model("WasteReport",wasteReportSchema);