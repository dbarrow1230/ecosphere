// /backend/models/shoppingListModel.js
import mongoose from 'mongoose';

const shoppingListSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
name:{type:String,required:true,trim:true},
description:{type:String,trim:true,default:''},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
type:{type:String,trim:true,default:'general'},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
budget:{type:Number,default:0},
targetDate:{type:Date,default:null},
isFavorite:{type:Boolean,default:false}
},{timestamps:true,collection:'shopping_lists'});

export default mongoose.models.ShoppingList||mongoose.model('ShoppingList',shoppingListSchema);