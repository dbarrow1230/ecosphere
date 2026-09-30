// src/backend/models/waste/wasteRecord.js
import mongoose from "mongoose";

const wasteRecordSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 lotRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"InventoryLot"},
 qty:{type:Number,required:true,min:0},
 cost:{type:Number,default:0,min:0},
 reason:{type:String,trim:true,default:""},
 wasteDate:{type:Date,required:true,index:true},
 notes:{type:String,trim:true,default:""},
 createdByRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"User"}
},{ timestamps:true, collection:"waste_records"});

wasteRecordSchema.index({business_id:1,locationRef:1,wasteDate:-1});
wasteRecordSchema.index({business_id:1,beverageItemRef:1});
wasteRecordSchema.index({business_id:1,reason:1});

const WasteRecord=mongoose.models.WasteRecord||mongoose.model("WasteRecord",wasteRecordSchema);

export default WasteRecord;//backend\models\waste\wasteRecordModel.js
import mongoose from "mongoose";

const wasteRecordSchema=new mongoose.Schema({
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},

 recordDate:{type:Date,default:Date.now},

 entries:[{type:mongoose.Schema.Types.ObjectId,ref:"WasteEntry"}],

 totalCost:{type:Number,default:0,min:0},
 totalQuantity:{type:Number,default:0,min:0},

 summary:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"waste_records"});

wasteRecordSchema.index({clientBusiness:1});
wasteRecordSchema.index({project:1});
wasteRecordSchema.index({recordDate:1});
wasteRecordSchema.index({isActive:1});

export default mongoose.models.WasteRecord||mongoose.model("WasteRecord",wasteRecordSchema);