// /backend/models/purchaseItemModel.js
import mongoose from 'mongoose';

const purchaseItemSchema=new mongoose.Schema({
purchase:{type:mongoose.Schema.Types.ObjectId,ref:'Purchase',required:true},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
shoppingListItem:{type:mongoose.Schema.Types.ObjectId,ref:'ShoppingListItem',default:null},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
quantity:{type:Number,required:true,default:1},
unitPrice:{type:Number,required:true,default:0},
discountAmount:{type:Number,default:0},
taxAmount:{type:Number,default:0},
subtotal:{type:Number,required:true,default:0},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'purchase_items'});

export default mongoose.models.PurchaseItem||mongoose.model('PurchaseItem',purchaseItemSchema);