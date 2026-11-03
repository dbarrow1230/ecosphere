// backend/modelpayroll/w2Model.js
import mongoose from "mongoose";

const addressSchema=new mongoose.Schema({
 line1:{type:String,trim:true,default:""},
 line2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:String,trim:true,default:""},
 postalCode:{type:String,trim:true,default:""},
 country:{type:String,trim:true,default:""}
},{_id:false});

const w2BoxSchema=new mongoose.Schema({
 box1_wages:{type:Number,default:0,min:0},
 box2_federalTax:{type:Number,default:0,min:0},
 box3_socialSecurityWages:{type:Number,default:0,min:0},
 box4_socialSecurityTax:{type:Number,default:0,min:0},
 box5_medicareWages:{type:Number,default:0,min:0},
 box6_medicareTax:{type:Number,default:0,min:0},
 box7_socialSecurityTips:{type:Number,default:0,min:0},
 box8_allocatedTips:{type:Number,default:0,min:0},
 box10_dependentCare:{type:Number,default:0,min:0},
 box12_codes:[{
  code:{type:String,trim:true},
  amount:{type:Number,default:0,min:0}
 }],
 box13_statutoryEmployee:{type:Boolean,default:false},
 box13_retirementPlan:{type:Boolean,default:false},
 box13_thirdPartySickPay:{type:Boolean,default:false},
 box14_other:[{
  label:{type:String,trim:true},
  amount:{type:Number,default:0,min:0}
 }]
},{_id:false});

const w2Schema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 employee:{type:mongoose.Schema.Types.ObjectId,ref:"Employee",required:true,index:true},

 taxYear:{type:Number,required:true,index:true},

 payrolls:[{type:mongoose.Schema.Types.ObjectId,ref:"Payroll"}],

 employeeSSNLast4:{type:String,trim:true,default:""},
 employeeAddress:{type:addressSchema,default:{}},

 employerEIN:{type:String,trim:true,default:""},
 employerName:{type:String,trim:true,default:""},
 employerAddress:{type:addressSchema,default:{}},

 boxes:{type:w2BoxSchema,default:{}},

 totalWages:{type:Number,default:0,min:0},
 totalFederalTax:{type:Number,default:0,min:0},
 totalSocialSecurityTax:{type:Number,default:0,min:0},
 totalMedicareTax:{type:Number,default:0,min:0},

 status:{type:String,enum:["draft","final","filed","corrected"],default:"draft"},

 generatedAt:{type:Date,default:null},
 filedAt:{type:Date,default:null}
},{timestamps:true,collection:"w2s"});

w2Schema.index({business:1,employee:1,taxYear:1},{unique:true});
w2Schema.index({business:1,taxYear:1,status:1});

const W2=mongoose.models.W2||mongoose.model("W2",w2Schema);

export default W2;