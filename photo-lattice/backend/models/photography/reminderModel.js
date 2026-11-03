import mongoose from "mongoose";
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,required:true,trim:true,maxLength:200},
 description:{type:String,trim:true,default:"",maxLength:10000},
 dueAt:{type:Date,required:true},
 shootRef:{type:mongoose.Schema.Types.ObjectId,ref:"PhotoShoot",default:null},
 completed:{type:Boolean,default:false}
},{timestamps:true,collection:"photography_reminders"});
export default mongoose.models.PhotoReminder||mongoose.model("PhotoReminder",schema);
