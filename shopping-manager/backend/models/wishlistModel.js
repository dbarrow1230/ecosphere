// /backend/models/wishlistModel.js
import mongoose from 'mongoose';

const wishlistSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
product:{type:mongoose.Schema.Types.ObjectId,ref:'Product',default:null},
store:{type:mongoose.Schema.Types.ObjectId,ref:'Store',default:null},
targetPrice:{type:Number,default:0},
currentPrice:{type:Number,default:0},
priority:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
status:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'wish_lists'});

export default mongoose.models.Wishlist||mongoose.model('Wishlist',wishlistSchema);
