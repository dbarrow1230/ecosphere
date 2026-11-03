// /backend/models/inventoryModel.js
import mongoose from 'mongoose';

const inventorySchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
quantity:{type:Number,required:true,default:0},
minQuantity:{type:Number,default:0},
maxQuantity:{type:Number,default:0},
reorderLevel:{type:Number,default:0},
purchaseDate:{type:Date,default:null},
expiryDate:{type:Date,default:null},
location:{type:String,trim:true,default:''},
notes:{type:String,trim:true,default:''},
isLowStock:{type:Boolean,default:false}
},{timestamps:true,collection:'inventories'});

export default mongoose.models.Inventory||mongoose.model('Inventory',inventorySchema);