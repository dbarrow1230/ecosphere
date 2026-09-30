import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
 eventName:{type:String,required:true,trim:true},
 clientName:{type:String,required:true,trim:true},
 client:{type:mongoose.Schema.Types.ObjectId,ref:"Customer",default:null},
 eventDate:{type:Date,default:null},
 eventTime:{type:String,trim:true,default:""},
 guestCount:{type:Number,default:0},
 status:{
  type:String,
  enum:["Pending","Confirmed","Prep","Completed","Cancelled"],
  default:"Pending"
 },
 location:{type:String,trim:true,default:""},
 notes:[{type:String,trim:true}]
},{timestamps:true,collection:"events"});

eventSchema.index({eventDate:1});
eventSchema.index({status:1});

const Event=mongoose.models.Event||mongoose.model("Event",eventSchema);

export default Event;
