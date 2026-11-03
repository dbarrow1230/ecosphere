//backend\models\inventory\PantryItemModel.js
import mongoose from "mongoose";

const pantryItemSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",required:true},
 quantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 location:{type:String,trim:true,default:""},
 lastChecked:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"pantry_items"});

pantryItemSchema.index({item:1});

export default mongoose.models.PantryItem||mongoose.model("PantryItem",pantryItemSchema);