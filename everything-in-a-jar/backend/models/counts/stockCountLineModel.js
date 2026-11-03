import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const stockCountLineSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 stockCountRef:{type:Schema.Types.ObjectId,ref:"StockCount",required:true,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 lotRef:{type:Schema.Types.ObjectId,ref:"InventoryLot",default:null,index:true},
 expectedQuantity:{type:Number,default:0,min:0},
 countedQuantity:{type:Number,default:0,min:0},
 varianceQuantity:{type:Number,default:0},
 unit:{type:String,trim:true,default:""},
 reasonCode:{type:String,trim:true,default:""},
 countedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"stock_count_lines"});

stockCountLineSchema.index({business_id:1,stockCountRef:1,itemName:1,lotRef:1});

export default businessInfoConnection.models.StockCountLine||businessInfoConnection.model("StockCountLine",stockCountLineSchema);
