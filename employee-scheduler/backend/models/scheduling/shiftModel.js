import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const breakSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 start:{type:String,trim:true,default:""},
 end:{type:String,trim:true,default:""},
 paid:{type:Boolean,default:false},
 minutes:{type:Number,default:0}
},{_id:false});

const assignedEmployeeSchema=new mongoose.Schema({
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true},
 assignedAt:{type:Date,default:Date.now},
 assignedBy:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null},
 status:{type:String,enum:["assigned","confirmed","declined","completed","removed"],default:"assigned"},
 notes:{type:[noteSchema],default:[]}
},{_id:false});

const shiftSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},

 title:{type:String,required:true,trim:true},
 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null,index:true},
 shiftLocation:{type:mongoose.Schema.Types.ObjectId,ref:"ShiftLocation",default:null,index:true},

 shiftDate:{type:Date,required:true,index:true},
 startTime:{type:String,required:true,trim:true},
 endTime:{type:String,required:true,trim:true},

 shiftType:{type:String,enum:["morning","afternoon","evening","night","overnight","custom"],default:"custom"},
 status:{type:String,enum:["draft","open","partially-filled","assigned","confirmed","completed","cancelled"],default:"draft"},

 requiredEmployees:{type:Number,default:1},
 assignedEmployees:{type:[assignedEmployeeSchema],default:[]},

 breaks:{type:[breakSchema],default:[]},

 payRate:{type:Number,default:0},
 estimatedHours:{type:Number,default:0},
 actualHours:{type:Number,default:0},

 notes:{type:[noteSchema],default:[]},
 tags:[{type:String,trim:true}],

 published:{type:Boolean,default:false},
 publishedAt:{type:Date,default:null},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",default:null}
},{timestamps:true,collection:"shifts"});

shiftSchema.index({business:1,shiftDate:1,status:1});
shiftSchema.index({business:1,department:1,shiftDate:1});
shiftSchema.index({business:1,role:1,shiftDate:1});
shiftSchema.index({business:1,shiftLocation:1,shiftDate:1});
shiftSchema.index({"assignedEmployees.employee":1,shiftDate:1});

const Shift=mongoose.models.Shift||mongoose.model("Shift",shiftSchema);

export default Shift;