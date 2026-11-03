import mongoose from "mongoose";

const inventorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true},
 sku:{type:String,required:true,trim:true,uppercase:true},
 quantityOnHand:{type:Number,default:0,min:0},
 reorderLevel:{type:Number,default:0,min:0},
 unit:{type:String,required:true,trim:true},
 costPerUnit:{type:Number,default:0,min:0},
 supplier:{type:String,trim:true,default:""},
 status:{type:String,enum:["in-stock","low","out-of-stock","discontinued"],default:"in-stock",index:true},
 area:{type:String,enum:["boh","foh"],default:"boh"},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"inventory"});

inventorySchema.index({sku:1},{unique:true});
inventorySchema.index({name:1});

const Inventory=mongoose.models.Inventory||mongoose.model("Inventory",inventorySchema);

export default Inventory;
