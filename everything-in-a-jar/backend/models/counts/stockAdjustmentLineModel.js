import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const stockAdjustmentLineSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 stockAdjustmentRef:{type:Schema.Types.ObjectId,ref:"StockAdjustment",required:true,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 lotRef:{type:Schema.Types.ObjectId,ref:"InventoryLot",default:null,index:true},
 quantityDelta:{type:Number,required:true},
 unit:{type:String,trim:true,default:""},
 reasonCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"stock_adjustment_lines"});

stockAdjustmentLineSchema.index({business_id:1,stockAdjustmentRef:1,itemName:1,lotRef:1});

export default businessInfoConnection.models.StockAdjustmentLine||businessInfoConnection.model("StockAdjustmentLine",stockAdjustmentLineSchema);
