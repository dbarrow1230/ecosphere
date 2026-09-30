//backend\models\reporting\consultingSnapshotModel.js
import mongoose from "mongoose";

const consultingSnapshotSchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 snapshotDate:{type:Date,default:Date.now},

 currentStage:{type:String,trim:true,default:""},
 currentStatus:{type:String,trim:true,default:""},

 activeMenus:{type:Number,default:0,min:0},
 openRecommendations:{type:Number,default:0,min:0},
 completedRecommendations:{type:Number,default:0,min:0},

 proposalCount:{type:Number,default:0,min:0},
 invoiceCount:{type:Number,default:0,min:0},
 totalBilled:{type:Number,default:0,min:0},
 totalPaid:{type:Number,default:0,min:0},
 totalExpenses:{type:Number,default:0,min:0},

 summary:{type:String,trim:true,default:""},
 keyUpdates:[{type:String,trim:true}],
 risks:[{type:String,trim:true}],
 nextSteps:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"consulting_snapshots"});

consultingSnapshotSchema.index({clientBusiness:1});
consultingSnapshotSchema.index({project:1});
consultingSnapshotSchema.index({snapshotDate:1});
consultingSnapshotSchema.index({isActive:1});

export default mongoose.models.ConsultingSnapshot||mongoose.model("ConsultingSnapshot",consultingSnapshotSchema);