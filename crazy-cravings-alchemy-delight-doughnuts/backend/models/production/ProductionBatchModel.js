// backend/models/production/ProductionBatchModel.js
import mongoose from "mongoose";

const productionItemSchema=new mongoose.Schema({
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",required:true,index:true},
 recipe:{type:mongoose.Schema.Types.ObjectId,ref:"Recipe",default:null,index:true},

 plannedQty:{type:Number,required:true,min:0},
 producedQty:{type:Number,default:0,min:0},
 soldQty:{type:Number,default:0,min:0},
 wasteQty:{type:Number,default:0,min:0},
 remainingQty:{type:Number,default:0,min:0},

 unit:{type:String,trim:true,default:"each"},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const productionBatchSchema=new mongoose.Schema({
 batchNumber:{type:String,required:true,unique:true,index:true},

 productionDate:{type:Date,required:true,index:true},
 shift:{type:String,trim:true,default:""},

 items:{
  type:[productionItemSchema],
  required:true,
  validate:{
   validator:v=>Array.isArray(v)&&v.length>0,
   message:"Production batch must contain at least one item"
  }
 },

 costing:{type:mongoose.Schema.Types.ObjectId,ref:"ProductionCosting",default:null,index:true},

 status:{type:String,enum:["planned","in-progress","completed","cancelled"],default:"planned",index:true},

 startedAt:{type:Date,default:null},
 completedAt:{type:Date,default:null},

 preparedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
 approvedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},

 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true,index:true}
},{
 timestamps:true,
 collection:"production_batches"
});

productionBatchSchema.index({productionDate:1,status:1});
productionBatchSchema.index({"items.menuItem":1,productionDate:-1});

export default mongoose.model("ProductionBatch",productionBatchSchema);