import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const inventoryLotSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 lotNumber:{type:String,required:true,trim:true,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 batchRef:{type:Schema.Types.ObjectId,ref:"ProductionBatch",default:null,index:true},
 vendorRef:{type:Schema.Types.ObjectId,ref:"Vendor",default:null},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 receivedDate:{type:Date,default:Date.now,index:true},
 manufactureDate:{type:Date,default:null},
 expirationDate:{type:Date,default:null,index:true},
 quantityReceived:{type:Number,default:0,min:0},
 quantityOnHand:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 status:{type:String,enum:["available","allocated","hold","expired","depleted","recalled"],default:"available",index:true},
 storageRequirement:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"inventory_lots"});

inventoryLotSchema.index({business_id:1,lotNumber:1},{unique:true});
inventoryLotSchema.index({business_id:1,itemType:1,itemName:1});

export default businessInfoConnection.models.InventoryLot||businessInfoConnection.model("InventoryLot",inventoryLotSchema);
