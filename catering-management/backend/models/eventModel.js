// backend/models/eventModel.js
import mongoose from "mongoose";

const eventSchema=new mongoose.Schema({
 eventNumber:{type:String,trim:true,default:""},
 eventName:{type:String,required:true,trim:true},
 eventType:{type:String,trim:true,default:""},
 clientName:{type:String,required:true,trim:true},
 clientEmail:{type:String,trim:true,lowercase:true,default:""},
 clientPhone:{type:String,trim:true,default:""},
 eventDate:{type:Date,required:true},
 eventTime:{type:String,required:true,trim:true},
 endTime:{type:String,trim:true,default:""},
 serviceTime:{type:String,trim:true,default:""},
 guestCount:{type:Number,required:true,min:1},
 adultCount:{type:Number,default:0,min:0},
 childCount:{type:Number,default:0,min:0},
 vendorCount:{type:Number,default:0,min:0},
 status:{type:String,enum:["Pending","Confirmed","Prep","Completed","Cancelled"],default:"Pending"},
 location:{type:String,required:true,trim:true},
 address1:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:String,trim:true,default:""},
 postalCode:{type:String,trim:true,default:""},
 venueContact:{type:String,trim:true,default:""},
 venuePhone:{type:String,trim:true,default:""},
 serviceType:{type:String,trim:true,default:""},
 setupTime:{type:String,trim:true,default:""},
 breakdownTime:{type:String,trim:true,default:""},
 staffCount:{type:Number,default:0,min:0},
 kitchenAccess:{type:String,trim:true,default:""},
 powerRequirements:{type:String,trim:true,default:""},
 waterAccess:{type:String,trim:true,default:""},
 loadingInstructions:{type:String,trim:true,default:""},
 parkingInstructions:{type:String,trim:true,default:""},
 menuNotes:{type:String,trim:true,default:""},
 dietaryRequirements:{type:String,trim:true,default:""},
 allergies:{type:String,trim:true,default:""},
 rentalNotes:{type:String,trim:true,default:""},
 staffingNotes:{type:String,trim:true,default:""},
 timelineNotes:{type:String,trim:true,default:""},
 budget:{type:Number,default:0,min:0},
 quotedTotal:{type:Number,default:0,min:0},
 depositStatus:{type:String,trim:true,default:"Not Required"},
 notes:[{type:String,trim:true,default:""}]
},{ timestamps:true, collection:"events"});

eventSchema.index({eventNumber:1});

const Event=mongoose.models.Event||mongoose.model("Event",eventSchema);

export default Event;
