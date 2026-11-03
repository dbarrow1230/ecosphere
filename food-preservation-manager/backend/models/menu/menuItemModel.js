// backend/models/menu/menuItemModel.js
import mongoose from "mongoose";

const d=v=>v==null||v===""?v:mongoose.Types.Decimal128.fromString(String(v));

const menuItemSchema=new mongoose.Schema({
 menu:{type:mongoose.Schema.Types.ObjectId,ref:"Menu",required:true},

 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
 productBatch:{type:mongoose.Schema.Types.ObjectId,ref:"ProductBatch"},
 containerType:{type:mongoose.Schema.Types.ObjectId,ref:"ContainerType"},

 sectionKey:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""},

 nameOverride:{type:String,trim:true,default:""},
 descriptionOverride:{type:String,trim:true,default:""},

 priceOverride:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},

 availableQuantity:{type:Number,default:0},
 isAvailable:{type:Boolean,default:true},
 sortOrder:{type:Number,default:0},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"menu_items"});

const MenuItem=mongoose.models.MenuItem||mongoose.model("MenuItem",menuItemSchema);

export default MenuItem;