import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
 eventName:{type:String,required:true,trim:true},
 clientName:{type:String,required:true,trim:true},
 eventDate:{type:Date,required:true,index:true},
 eventTime:{type:String,required:true,trim:true},
 guestCount:{type:Number,required:true,min:1},
 status:{type:String,enum:["Pending","Confirmed","Prep","Completed","Cancelled"],default:"Pending",index:true},
 location:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{timestamps:true,collection:"events"});

eventSchema.index({eventDate:1,status:1});

const Event=mongoose.models.Event||mongoose.model("Event",eventSchema);

export default Event;
