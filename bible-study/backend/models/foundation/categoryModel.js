// /backend/models/foundation/inventoryModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const inventorySchema=new mongoose.Schema({
 category:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true},
 name:{type:String,required:true,trim:true},
 brand:{type:String,trim:true,default:""},
 productId:{type:String,trim:true,default:""},
 serialNumber:{type:String,trim:true,default:""},
 quantity:{type:Number,default:1,min:0},
 minQuantity:{type:Number,default:0,min:0},
 unitPrice:{type:Number,default:0,min:0},
 purchaseDate:{type:Date},
 expirationDate:{type:Date},
 discardDate:{type:Date},
 location:{type:String,trim:true,default:""},
 notes:{type:[noteSchema],default:[]},
 status:{type:String,enum:["active","used","expired","discarded"],default:"active"}
},{timestamps:true,collection:"inventory"});

inventorySchema.index({category:1});
inventorySchema.index({name:1});
inventorySchema.index({status:1});

const Inventory=mongoose.models.Inventory||mongoose.model("Inventory",inventorySchema);

export default Inventory;