import Business from "../reference/businessModel.js";
import Location from "../reference/LocationModel.js";
//backend/models/inventory/inventoryBalanceModel.js
import mongoose from "mongoose";

const inventoryBalanceSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Business},
 beverageItemRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"BeverageItem"},
 locationRef:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:Location},
 qtyOnHand:{type:Number,default:0},
 qtyReserved:{type:Number,default:0},
 qtyAvailable:{type:Number,default:0},
 qtyOnOrder:{type:Number,default:0},
 qtyInTransit:{type:Number,default:0},
 avgCost:{type:Number,default:0,min:0},
 lastCountedAt:{type:Date,default:null}
},{timestamps:true, collection:"inventory_balances"});

inventoryBalanceSchema.index({business_id:1,beverageItemRef:1,locationRef:1},{unique:true});
inventoryBalanceSchema.index({business_id:1,locationRef:1});
inventoryBalanceSchema.index({business_id:1,beverageItemRef:1});

const InventoryBalance=mongoose.models.InventoryBalance||mongoose.model("InventoryBalance",inventoryBalanceSchema);

export default InventoryBalance;