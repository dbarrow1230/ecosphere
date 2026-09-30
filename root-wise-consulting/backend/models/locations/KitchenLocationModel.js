//backend\models\locations\KitchenLocationModel.js
import mongoose from "mongoose";

const kitchenLocationSchema=new mongoose.Schema({
 location:{type:mongoose.Schema.Types.ObjectId,ref:"Location",required:true},

 kitchenType:{type:String,enum:["main","prep","pastry","bar","mobile","ghost","other"],default:"main"},

 stations:[{type:String,trim:true}],
 equipmentNotes:{type:String,trim:true,default:""},
 capacityNotes:{type:String,trim:true,default:""},

 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"kitchen_locations"});

kitchenLocationSchema.index({location:1},{unique:true});
kitchenLocationSchema.index({kitchenType:1});

export default mongoose.models.KitchenLocation||mongoose.model("KitchenLocation",kitchenLocationSchema);