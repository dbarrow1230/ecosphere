// /backend/models/currencyModel.js
import mongoose from 'mongoose';
import businessInfoConnection from '../db/businessInfoConnection.js';

const currencySchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
code:{type:String,required:true,trim:true,uppercase:true},
symbol:{type:String,trim:true,default:''},
country:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'currencies'});

currencySchema.index({code:1},{unique:true});

export default businessInfoConnection.models.Currency||businessInfoConnection.model('Currency',currencySchema);