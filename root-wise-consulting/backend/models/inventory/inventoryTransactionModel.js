//backend\models\inventory\inventoryTransactionModel.js
import mongoose from "mongoose";

const inventoryTransactionSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},
 lot:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryLot",default:null},
 type:{type:String,enum:["in","out","adjustment","waste","transfer"],required:true},
 quantity:{type:Number,required:true},
 unitCost:{type:Number,default:0,min:0},
 referenceType:{type:String,trim:true,default:""},
 referenceId:{type:mongoose.Schema.Types.ObjectId,default:null},
 transactionDate:{type:Date,default:Date.now},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"inventory_transactions"});

inventoryTransactionSchema.index({item:1});
inventoryTransactionSchema.index({type:1});
inventoryTransactionSchema.index({transactionDate:1});

export default mongoose.models.InventoryTransaction||mongoose.model("InventoryTransaction",inventoryTransactionSchema);