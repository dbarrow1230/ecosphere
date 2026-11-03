import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const receiptHeaderSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 content:{type:String,trim:true,default:""},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,ref:"Season",default:null,index:true},
 occasionRef:{type:mongoose.Schema.Types.ObjectId,ref:"Occasion",default:null,index:true},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"receipt_headers"});

receiptHeaderSchema.index({name:1});
receiptHeaderSchema.index({code:1},{unique:true,sparse:true});
receiptHeaderSchema.index({isActive:1});

const ReceiptHeader=businessInfoConnection.models.ReceiptHeader||businessInfoConnection.model("ReceiptHeader",receiptHeaderSchema);

export default ReceiptHeader;