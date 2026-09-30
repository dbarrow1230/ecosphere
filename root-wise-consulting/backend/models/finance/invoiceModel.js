//backend/models/finance/invoiceModel.js
import mongoose from "mongoose";

const invoiceLineItemSchema=new mongoose.Schema({
 service:{type:mongoose.Schema.Types.ObjectId,ref:"Service",default:null},
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 unit:{type:String,enum:["flat","hour","day","week","item","menu","session","custom"],default:"flat"},
 quantity:{type:Number,default:1,min:0},
 unitRate:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 sortOrder:{type:Number,default:0}
},{_id:false});

const invoiceSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},
 proposal:{type:mongoose.Schema.Types.ObjectId,ref:"Proposal",default:null},
 estimate:{type:mongoose.Schema.Types.ObjectId,ref:"Estimate",default:null},

 invoiceNumber:{type:String,required:true,trim:true},
 title:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 issueDate:{type:Date,default:Date.now},
 dueDate:{type:Date,default:null},

 lineItems:[invoiceLineItemSchema],

 subtotal:{type:Number,default:0,min:0},
 discount:{type:Number,default:0,min:0},
 taxRate:{type:Number,default:0,min:0},
 taxAmount:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 amountPaid:{type:Number,default:0,min:0},
 balanceDue:{type:Number,default:0,min:0},

 status:{type:String,enum:["draft","sent","partial","paid","overdue","void"],default:"draft"},
 paymentTerms:{type:String,trim:true,default:""},
 sentAt:{type:Date,default:null},
 paidAt:{type:Date,default:null},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"invoices"});

invoiceSchema.index({project:1});
invoiceSchema.index({clientBusiness:1});
invoiceSchema.index({proposal:1});
invoiceSchema.index({estimate:1});
invoiceSchema.index({invoiceNumber:1},{unique:true});
invoiceSchema.index({status:1});
invoiceSchema.index({dueDate:1});
invoiceSchema.index({isActive:1});

const Invoice=mongoose.models.Invoice||mongoose.model("Invoice",invoiceSchema);

export default Invoice;