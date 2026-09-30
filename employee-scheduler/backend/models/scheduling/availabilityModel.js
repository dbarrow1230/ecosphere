import mongoose from "mongoose";

const timeRangeSchema=new mongoose.Schema({
 start:{type:String,required:true,trim:true},
 end:{type:String,required:true,trim:true}
},{_id:false});

const weeklyAvailabilitySchema=new mongoose.Schema({
 dayOfWeek:{type:Number,required:true,min:0,max:6},
 isAvailable:{type:Boolean,default:true},
 ranges:{type:[timeRangeSchema],default:[]}
},{_id:false});

const availabilityOverrideSchema=new mongoose.Schema({
 date:{type:Date,required:true},
 isAvailable:{type:Boolean,default:false},
 ranges:{type:[timeRangeSchema],default:[]},
 note:{type:String,trim:true,default:""}
},{_id:false});

const availabilitySchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},

 weekly:{type:[weeklyAvailabilitySchema],default:[]},
 overrides:{type:[availabilityOverrideSchema],default:[]},

 effectiveFrom:{type:Date,default:null},
 effectiveTo:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"availability"});

availabilitySchema.index({business:1,employee:1},{unique:true});

const Availability=mongoose.models.Availability||mongoose.model("Availability",availabilitySchema);

export default Availability;