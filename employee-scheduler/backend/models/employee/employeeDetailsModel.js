// backend/models/employee/employeeDetailsModel.js
import mongoose from "mongoose";

const noteSchema=new mongoose.Schema({
 date:{type:Date,default:Date.now},
 text:{type:String,trim:true}
},{_id:false});

const employeeDetailsSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true,unique:true},

 middleName:{type:String,trim:true,default:""},
 dateOfBirth:{type:Date,default:null},
 gender:{type:String,trim:true,default:""},
 maritalStatus:{type:String,trim:true,default:""},

 addressLine1:{type:String,trim:true,default:""},
 addressLine2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null,index:true},
 countyRef:{type:mongoose.Schema.Types.ObjectId,ref:"County",default:null,index:true},
 countryRef:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null,index:true},
 postalCode:{type:String,trim:true,default:""},

 alternatePhone:{type:String,trim:true,default:""},
 alternateEmail:{type:String,trim:true,lowercase:true,default:""},

 nationalIdLast4:{type:String,trim:true,default:""},
 taxIdLast4:{type:String,trim:true,default:""},

 hireSource:{type:String,trim:true,default:""},
 terminationDate:{type:Date,default:null},
 rehireEligible:{type:Boolean,default:true},

 notes:{type:[noteSchema],default:[]}
},{timestamps:true,collection:"employee_details"});

employeeDetailsSchema.index({business:1,employee:1},{unique:true});
employeeDetailsSchema.index({business:1,stateRef:1});
employeeDetailsSchema.index({business:1,countyRef:1});
employeeDetailsSchema.index({business:1,countryRef:1});

const EmployeeDetails=mongoose.models.EmployeeDetails||mongoose.model("EmployeeDetails",employeeDetailsSchema);

export default EmployeeDetails;