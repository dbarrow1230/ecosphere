// /backend/models/budgetModel.js
import mongoose from 'mongoose';

const budgetAllocationSchema=new mongoose.Schema({
budgetType:{type:String,required:true,trim:true},
category:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
targetName:{type:String,trim:true,default:''},
amount:{type:Number,required:true,default:0},
spent:{type:Number,default:0},
remainingAmount:{type:Number,default:0},
percentUsed:{type:Number,default:0},
isOverBudget:{type:Boolean,default:false},
isPriority:{type:Boolean,default:false},
notes:{type:String,trim:true,default:''}
},{_id:true});

const budgetTypeSchema=new mongoose.Schema({
key:{type:String,required:true,trim:true},
label:{type:String,required:true,trim:true},
amount:{type:Number,required:true,default:0},
spent:{type:Number,default:0},
remainingAmount:{type:Number,default:0},
percentUsed:{type:Number,default:0},
isOverBudget:{type:Boolean,default:false}
},{_id:false});

const budgetSchema=new mongoose.Schema({
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
name:{type:String,required:true,trim:true},
budgetType:{type:String,trim:true,default:''},
budgetTypes:[budgetTypeSchema],
totalAmount:{type:Number,required:true,default:0},
totalSpent:{type:Number,default:0},
period:{type:mongoose.Schema.Types.ObjectId,ref:'Status',default:null},
startDate:{type:Date,required:true},
endDate:{type:Date,required:true},
alertAtPercent:{type:Number,default:80},
allocations:[budgetAllocationSchema],
isOverBudget:{type:Boolean,default:false},
isActive:{type:Boolean,default:true},
notes:{type:String,trim:true,default:''}
},{timestamps:true,collection:'budgets'});

export default mongoose.models.Budget||mongoose.model('Budget',budgetSchema);
