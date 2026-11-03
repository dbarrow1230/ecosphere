import mongoose from "mongoose";

const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T12:00:00Z`))&&new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)===value;
const validTime=value=>!value||/^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const dailyTaskSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,required:true,trim:true,maxlength:200},
 details:{type:String,default:"",trim:true,maxlength:5000},
 scheduledDate:{type:String,required:true,validate:{validator:validDate,message:"Use a valid task date (YYYY-MM-DD)"}},
 startTime:{type:String,default:"",validate:{validator:validTime,message:"Use a valid time (HH:mm)"}},
 recurrenceRule:{type:String,enum:["none","daily","weekly","biweekly","monthly"],default:"none"},
 recurrenceEndDate:{type:String,default:"",validate:{validator:value=>!value||validDate(value),message:"Use a valid repeat end date"}},
 completedDates:{type:[String],default:[],validate:{validator:dates=>dates.every(validDate),message:"Use valid completion dates"}},
 completed:{type:Boolean,default:false}
},{timestamps:true,collection:"daily_tasks"});

dailyTaskSchema.index({userId:1,scheduledDate:1,startTime:1});

export default mongoose.model("DailyTask",dailyTaskSchema);
