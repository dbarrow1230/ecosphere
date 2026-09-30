// backend/models/reference/receiptTemplateModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const receiptTemplateSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 description:{type:String,trim:true,default:""},
 templateKey:{type:String,trim:true,default:""},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,ref:"Season",default:null,index:true},
 occasionRef:{type:mongoose.Schema.Types.ObjectId,ref:"Occasion",default:null,index:true},
 isDefault:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"receipt_templates"});

receiptTemplateSchema.index({name:1});
receiptTemplateSchema.index({code:1},{unique:true,sparse:true});
receiptTemplateSchema.index({isActive:1});

const ReceiptTemplate=businessInfoConnection.models.ReceiptTemplate||businessInfoConnection.model("ReceiptTemplate",receiptTemplateSchema);

export default ReceiptTemplate;
