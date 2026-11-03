// /backend/models/shoppingListItemModel.js
import mongoose from 'mongoose';

const shoppingListItemSchema=new mongoose.Schema({
shoppingList:{type:mongoose.Schema.Types.ObjectId,ref:'ShoppingList',required:true},
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',required:true},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
unit:{type:mongoose.Schema.Types.ObjectId,ref:'Unit',default:null},
quantity:{type:Number,required:true,default:1},
estimatedPrice:{type:Number,default:0},
priority:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
notes:{type:String,trim:true,default:''},
isPurchased:{type:Boolean,default:false},
purchasedAt:{type:Date,default:null}
},{timestamps:true,collection:'shopping_list_items'});

export default mongoose.models.ShoppingListItem||mongoose.model('ShoppingListItem',shoppingListItemSchema);