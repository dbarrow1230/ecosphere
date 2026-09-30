//backend\models\inventory\inventoryLotModel.js
import mongoose from "mongoose";

const inventoryLotSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},
 lotNumber:{type:String,trim:true,default:""},
 quantity:{type:Number,default:0,min:0},
 unitCost:{type:Number,default:0,min:0},
 receivedDate:{type:Date,default:Date.now},
 expirationDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"inventory_lots"});

inventoryLotSchema.index({item:1});
inventoryLotSchema.index({expirationDate:1});

export default mongoose.models.InventoryLot||mongoose.model("InventoryLot",inventoryLotSchema);