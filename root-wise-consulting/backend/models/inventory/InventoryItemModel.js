//backend\models\inventory\InventoryItemModel.js
import mongoose from "mongoose";

const inventoryItemSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:String,trim:true,default:""},
 unit:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 defaultCost:{type:Number,default:0,min:0},
 isActive:{type:Boolean,default:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"inventory_items"});

inventoryItemSchema.index({name:1});
inventoryItemSchema.index({category:1});

export default mongoose.models.InventoryItem||mongoose.model("InventoryItem",inventoryItemSchema);