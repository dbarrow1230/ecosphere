import mongoose from "mongoose";

export const services=["Accounting","Bookkeeping","Tax","Payroll","Notary"];
export const workStatuses=["Not started","In progress","Waiting on client","Completed","Cancelled"];
const schema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:"AccountingClient",required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:180},
 service:{type:String,enum:services,required:true},
 status:{type:String,enum:workStatuses,default:"Not started"},
 dueDate:{type:Date,default:null},
 notes:{type:String,trim:true,maxlength:3000,default:""},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
},{timestamps:true,collection:"accounting_work"});
schema.index({client:1,status:1,dueDate:1});
export default mongoose.models.AccountingWork||mongoose.model("AccountingWork",schema);
