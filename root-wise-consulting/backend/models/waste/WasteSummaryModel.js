//backend\models\waste\WasteSummaryModel.js
import mongoose from "mongoose";

const wasteSummarySchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 periodStart:{type:Date,default:null},
 periodEnd:{type:Date,default:null},

 totalWasteCost:{type:Number,default:0,min:0},
 totalWasteQuantity:{type:Number,default:0,min:0},

 topReasons:[{
  reason:{type:mongoose.Schema.Types.ObjectId,ref:"WasteReason",default:null},
  totalCost:{type:Number,default:0,min:0}
 }],

 topItems:[{
  item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",default:null},
  itemName:{type:String,trim:true,default:""},
  totalCost:{type:Number,default:0,min:0}
 }],

 recommendations:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"waste_summaries"});

wasteSummarySchema.index({clientBusiness:1});
wasteSummarySchema.index({project:1});
wasteSummarySchema.index({periodStart:1,periodEnd:1});
wasteSummarySchema.index({isActive:1});

export default mongoose.models.WasteSummary||mongoose.model("WasteSummary",wasteSummarySchema);