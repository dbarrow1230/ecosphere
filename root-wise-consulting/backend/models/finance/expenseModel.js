//backend/models/finance/expenseModel.js
import mongoose from "mongoose";

const expenseLineItemSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},
 category:{type:String,enum:["travel","lodging","meals","ingredients","testing","printing","software","contractor","equipment","supplies","other"],default:"other"},
 quantity:{type:Number,default:1,min:0},
 unitCost:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},
 sortOrder:{type:Number,default:0}
},{_id:false});

const expenseSchema=new mongoose.Schema({
 project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
 clientBusiness:{type:mongoose.Schema.Types.ObjectId,ref:"ClientBusiness",required:true},

 expenseNumber:{type:String,trim:true,default:""},
 expenseDate:{type:Date,default:Date.now},
 vendor:{type:String,trim:true,default:""},
 category:{type:String,enum:["travel","lodging","meals","ingredients","testing","printing","software","contractor","equipment","supplies","other"],default:"other"},
 title:{type:String,required:true,trim:true},
 description:{type:String,trim:true,default:""},

 lineItems:[expenseLineItemSchema],

 subtotal:{type:Number,default:0,min:0},
 taxAmount:{type:Number,default:0,min:0},
 total:{type:Number,default:0,min:0},

 billableToClient:{type:Boolean,default:false},
 reimbursable:{type:Boolean,default:false},
 reimbursedAmount:{type:Number,default:0,min:0},

 receiptUrl:{type:String,trim:true,default:""},
 status:{type:String,enum:["draft","submitted","approved","paid","reimbursed","void"],default:"draft"},

 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"expenses"});

expenseSchema.index({project:1});
expenseSchema.index({clientBusiness:1});
expenseSchema.index({expenseDate:1});
expenseSchema.index({category:1});
expenseSchema.index({status:1});
expenseSchema.index({isActive:1});

const Expense=mongoose.models.Expense||mongoose.model("Expense",expenseSchema);

export default Expense;