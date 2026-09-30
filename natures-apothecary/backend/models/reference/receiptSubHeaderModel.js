import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const receiptSubHeaderSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:undefined,set:value=>String(value||"").trim().toUpperCase()||undefined},
 content:{type:String,trim:true,default:""},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,ref:"Season",default:null,index:true},
 occasionRef:{type:mongoose.Schema.Types.ObjectId,ref:"Occasion",default:null,index:true},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"receipt_subheaders"});

receiptSubHeaderSchema.index({name:1});
receiptSubHeaderSchema.index({code:1},{unique:true,sparse:true});
receiptSubHeaderSchema.index({isActive:1});

const ReceiptSubHeader=businessInfoConnection.models.ReceiptSubHeader||businessInfoConnection.model("ReceiptSubHeader",receiptSubHeaderSchema);

export default ReceiptSubHeader;
