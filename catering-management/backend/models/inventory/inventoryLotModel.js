//backend/models/inventory/inventoryLotModel.js
import mongoose from "mongoose";

const inventoryLotSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Location"},
 lotNumber:{type:String,required:true,trim:true},
 expiryDate:{type:Date,default:null,index:true},
 receivedDate:{type:Date,default:null},
 qtyOnHand:{type:Number,default:0},
 unitCost:{type:Number,default:0,min:0},
 status:{type:String,enum:["active","expired","depleted","hold"],default:"active",index:true}
},{ timestamps:true, collection:"inventory_lots"});

inventoryLotSchema.index({business_id:1,beverageItemRef:1,locationRef:1,lotNumber:1},{unique:true});
inventoryLotSchema.index({business_id:1,expiryDate:1});
inventoryLotSchema.index({business_id:1,status:1});

const InventoryLot=mongoose.models.InventoryLot||mongoose.model("InventoryLot",inventoryLotSchema);

export default InventoryLot;