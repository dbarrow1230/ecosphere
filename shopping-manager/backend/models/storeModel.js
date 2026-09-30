// /backend/models/storeModel.js
import mongoose from 'mongoose';

const storeSchema=new mongoose.Schema({
name:{type:String,required:true,trim:true},
slug:{type:String,trim:true,lowercase:true,default:''},
description:{type:String,trim:true,default:''},
email:{type:String,trim:true,lowercase:true,default:''},
phone:{type:String,trim:true,default:''},
website:{type:String,trim:true,default:''},
logo:{type:String,default:''},
address1:{type:String,trim:true,default:''},
address2:{type:String,trim:true,default:''},
city:{type:String,trim:true,default:''},
state:{type:mongoose.Schema.Types.ObjectId,ref:'State',default:null},
country:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
postalCode:{type:String,trim:true,default:''},
location:{type:{type:String,enum:['Point'],default:'Point'},
coordinates:{type:[Number],default:[0,0]}
},
isOnline:{type:Boolean,default:false},
isActive:{type:Boolean,default:true}
},{timestamps:true,collection:'stores'});

storeSchema.index({location:'2dsphere'});

export default mongoose.models.Store||mongoose.model('Store',storeSchema);