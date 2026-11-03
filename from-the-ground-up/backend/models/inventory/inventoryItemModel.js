import mongoose from "mongoose";

const inventoryItemSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 business_id:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true,index:true},
 sku:{type:String,trim:true,default:"",index:true},
 quantityOnHand:{type:Number,default:0,min:0},
 reorderLevel:{type:Number,default:0,min:0},
 unit:{type:String,required:true,trim:true},
 costPerUnit:{type:Number,default:0,min:0},
 supplier:{type:String,trim:true,default:""},
 status:{type:String,enum:["in-stock","low","out-of-stock","discontinued"],default:"in-stock",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"inventory_items"});

inventoryItemSchema.index({business:1,name:1,sku:1});
inventoryItemSchema.index({business_id:1,name:1,sku:1});

const InventoryItem=mongoose.models.InventoryItem||mongoose.model("InventoryItem",inventoryItemSchema);

export default InventoryItem;
