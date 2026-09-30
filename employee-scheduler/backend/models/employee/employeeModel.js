// backend/models/employee/employeeModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const employeeSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 department:{type:mongoose.Schema.Types.ObjectId,ref:"Department",default:null,index:true},

 firstName:{type:String,required:true,trim:true},
 lastName:{type:String,required:true,trim:true},

 email:{type:String,required:true,trim:true,lowercase:true},
 phone:{type:String,trim:true,default:""},
 employeeId:{type:String,required:true,trim:true,uppercase:true},

 role:{type:mongoose.Schema.Types.ObjectId,ref:"Role",default:null,index:true},
 employmentType:{type:String,enum:["full-time","part-time","contract","temporary","seasonal"],default:"part-time"},
 payType:{type:String,enum:["hourly","salary"],default:"hourly"},
 overtimeEligible:{type:Boolean,default:true},
 status:{type:String,enum:["active","inactive","terminated","on-leave","vacation"],default:"active"},

 hireDate:{type:Date,default:null},
 originalHireDate:{type:Date,default:null},
 lastHireDate:{type:Date,default:null},
 lastArchivedAt:{type:Date,default:null},

 hourlyRate:{type:Number,default:0},
 salaryAmount:{type:Number,default:0},
 minHoursPerWeek:{type:Number,default:0},
 maxHoursPerWeek:{type:Number,default:40},
 preferredHoursPerWeek:{type:Number,default:0},

 preferredShiftTypes:[{type:String,enum:["morning","afternoon","evening","night","overnight","custom"]}],
 skills:[{type:String,trim:true}],
 shiftLocations:[{type:mongoose.Schema.Types.ObjectId,ref:"ShiftLocation"}],

 isManager:{type:Boolean,default:false},

 employeeDetails:{type:mongoose.Schema.Types.ObjectId,ref:"EmployeeDetails",default:null,index:true},
 emergencyContact:{type:mongoose.Schema.Types.ObjectId,ref:"EmergencyContact",default:null,index:true},

 notes:{type:[noteSchema],default:[]},
 isActive:{type:Boolean,default:true},

 isArchived:{type:Boolean,default:false},
 archivedAt:{type:Date,default:null},
 archivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 archiveReason:{type:String,trim:true,default:""},
 unarchivedAt:{type:Date,default:null},
 unarchivedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"employees",toJSON:{virtuals:true},toObject:{virtuals:true}});

employeeSchema.virtual("fullName").get(function(){
 return `${this.firstName||""} ${this.lastName||""}`.trim();
});

employeeSchema.pre("save",function(next){
 if(this.hireDate&&!this.originalHireDate)this.originalHireDate=this.hireDate;
 if(this.hireDate)this.lastHireDate=this.hireDate;
 if(this.payType==="salary")this.overtimeEligible=false;
 next();
});

employeeSchema.index({business:1,email:1},{unique:true});
employeeSchema.index({business:1,employeeId:1},{unique:true});
employeeSchema.index({business:1,department:1});
employeeSchema.index({business:1,role:1});
employeeSchema.index({business:1,status:1});
employeeSchema.index({business:1,isArchived:1});
employeeSchema.index({business:1,lastHireDate:1});
employeeSchema.index({business:1,lastArchivedAt:1});

const Employee=mongoose.models.Employee||mongoose.model("Employee",employeeSchema);

export default Employee;