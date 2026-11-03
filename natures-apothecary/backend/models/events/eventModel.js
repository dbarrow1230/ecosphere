import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
 eventName:{type:String,required:true,trim:true},
 clientName:{type:String,required:true,trim:true},
 eventDate:{type:Date,required:true},
 eventTime:{type:String,trim:true,default:""},
 guestCount:{type:Number,min:0,default:0},
 status:{type:String,enum:["Pending","Confirmed","Prep","Completed","Cancelled"],default:"Pending"},
 location:{type:String,trim:true,default:""},
 notes:{type:[String],default:[]}
},{timestamps:true,collection:"events"});

eventSchema.index({eventDate:1});
eventSchema.index({status:1});

export default mongoose.models.Event||mongoose.model("Event",eventSchema);
