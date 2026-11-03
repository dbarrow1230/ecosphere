import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const inventoryBalanceSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 quantityOnHand:{type:Number,default:0,min:0},
 quantityAllocated:{type:Number,default:0,min:0},
 quantityAvailable:{type:Number,default:0,min:0},
 reorderPoint:{type:Number,default:0,min:0},
 parLevel:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 status:{type:String,enum:["inStock","lowStock","outOfStock","inactive"],default:"inStock",index:true},
 lastCountedAt:{type:Date,default:null}
},{timestamps:true,collection:"inventory_balances"});

inventoryBalanceSchema.index({business_id:1,itemType:1,itemName:1,locationRef:1},{unique:true});

export default businessInfoConnection.models.InventoryBalance||businessInfoConnection.model("InventoryBalance",inventoryBalanceSchema);
