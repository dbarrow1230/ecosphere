import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const wasteRecordSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 wasteDate:{type:Date,default:Date.now,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 lotRef:{type:Schema.Types.ObjectId,ref:"InventoryLot",default:null,index:true},
 batchRef:{type:Schema.Types.ObjectId,ref:"ProductionBatch",default:null,index:true},
 quantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 reason:{type:String,enum:["spoilage","breakage","expired","qualityFailure","overproduction","sample","other"],default:"other",index:true},
 estimatedCost:{type:Number,default:0,min:0},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"waste_records"});

wasteRecordSchema.index({business_id:1,wasteDate:-1});

export default businessInfoConnection.models.WasteRecord||businessInfoConnection.model("WasteRecord",wasteRecordSchema);
