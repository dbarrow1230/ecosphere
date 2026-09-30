import mongoose from 'mongoose';

const reminderSchema=new mongoose.Schema({
	task:{type:mongoose.Schema.Types.ObjectId,ref:'Task',required:true},
	remindAt:{type:Date,required:true},
	message:{type:String,trim:true,default:''},
	deliveryType:{type:String,enum:["in_app","browser","email","sms"],default:"in_app"},
	email:{type:String,trim:true,default:''},
	phone:{type:String,trim:true,default:''},
	isSent:{type:Boolean,default:false},
	sentAt:{type:Date,default:null},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"reminders"});

const Reminder=mongoose.models.TaskReminder||mongoose.model('TaskReminder',reminderSchema);

export default Reminder;