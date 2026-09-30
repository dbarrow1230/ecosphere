//backend\models\reporting\ReportModel.js
import mongoose from "mongoose";

const reportSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 reportType:{type:String,enum:["consulting-snapshot","project","menu-performance","revenue","waste","custom"],default:"custom"},

 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",default:null},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 periodStart:{type:Date,default:null},
 periodEnd:{type:Date,default:null},
 generatedAt:{type:Date,default:Date.now},

 summary:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 status:{type:String,enum:["draft","final","archived"],default:"draft"},
 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"reports"});

reportSchema.index({reportType:1});
reportSchema.index({clientBusiness:1});
reportSchema.index({project:1});
reportSchema.index({periodStart:1,periodEnd:1});
reportSchema.index({status:1});
reportSchema.index({isActive:1});

export default mongoose.models.Report||mongoose.model("Report",reportSchema);