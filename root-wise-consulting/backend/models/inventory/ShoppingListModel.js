//backend\models\inventory\ShoppingListModel.js
import mongoose from "mongoose";

const shoppingListItemSchema=new mongoose.Schema({
 item:{type:mongoose.Schema.Types.ObjectId,ref:"InventoryItem",default:null},
 name:{type:String,trim:true,default:""},
 quantity:{type:Number,default:1,min:0},
 unit:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 isPurchased:{type:Boolean,default:false}
},{_id:false});

const shoppingListSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 items:[shoppingListItemSchema],
 neededBy:{type:Date,default:null},
 status:{type:String,enum:["open","in-progress","completed","archived"],default:"open"},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"shopping_lists"});

shoppingListSchema.index({status:1});
shoppingListSchema.index({neededBy:1});

export default mongoose.models.ShoppingList||mongoose.model("ShoppingList",shoppingListSchema);