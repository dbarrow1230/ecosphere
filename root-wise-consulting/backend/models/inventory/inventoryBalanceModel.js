//backend\models\inventory\inventoryBalanceModel.js
import mongoose from "mongoose";

const inventoryBalanceSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},
 quantityOnHand:{type:Number,default:0,min:0},
 averageCost:{type:Number,default:0,min:0},
 lastUpdated:{type:Date,default:Date.now},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"inventory_balances"});

inventoryBalanceSchema.index({item:1},{unique:true});

export default mongoose.models.InventoryBalance||mongoose.model("InventoryBalance",inventoryBalanceSchema);