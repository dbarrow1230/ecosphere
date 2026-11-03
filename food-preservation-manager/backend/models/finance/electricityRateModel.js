// backend/models/electricityRateModel.js
import mongoose from "mongoose";

const d2=v=>v==null?v:mongoose.Types.Decimal128.fromString(Number(v).toFixed(2));
const d3=v=>v==null?v:mongoose.Types.Decimal128.fromString(Number(v).toFixed(3));

const newReadSchema=new mongoose.Schema({
 read:{type:Number},
 readType:{type:String,trim:true,enum:["actual","estimate"]},
 readDate:{type:Date}
},{_id:false});

const priorReadSchema=new mongoose.Schema({
 read:{type:Number},
 readType:{type:String,trim:true,enum:["actual","estimate"]},
 readDate:{type:Date},
 readDiff:{type:Number}
},{_id:false}); 

const lastBillingPeriodSchema=new mongoose.Schema({
 lastBillingSummary:{type:Date},
 totalCharges:{type:Number,default:0},
 payments:{type:Number,default:0}
},{_id:false});

const newChargesSchema=new mongoose.Schema({
 budgetBilledAmount:{type:Number,default:0},
 lateCharges:{type:Number,default:0},
 eapDiscount:{type:Number,default:0},
 dueDate:{type:Date}
},{_id:false});

const supplyChargesSchema=new mongoose.Schema({
 supply:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 ratePerKwh:{type:mongoose.Schema.Types.Decimal128,required:true,set:d3},
 merchantFunction:{type:Number,default:0},
 grtOtherTaxes:{type:Number,default:0},
 salestax:{type:Number,default:0}
},{_id:false});

const deliveryChargesSchema=new mongoose.Schema({
 basicService:{type:Number,default:0},
 delivery:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 deliveryRate:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 systemBenefitCharge:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.000"),set:d3},
 grtOtherTaxes:{type:Number,default:0},
 salestax:{type:Number,default:0}
},{_id:false});

const electricityRateSchema=new mongoose.Schema({
 electricityAccount:{type:mongoose.Schema.Types.ObjectId,ref:"ElectricityAccount",required:true},
 billingStartDate:{type:Date,required:true},
 billingEndDate:{type:Date,required:true},
 nextBillingDate:{type:Date,required:true},

 averageDailyUse:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0.00"),set:d2},

 budgetBilledToDate:{type:Number,default:0},
 actualBilledToDate:{type:Number,default:0},
 amountDue:{type:Number,default:0},
 amountPaid:{type:Number,default:0},

 newRead:{type:newReadSchema,default:()=>({})},
 priorRead:{type:priorReadSchema,default:()=>({})},

 lastBillingPeriod:{type:lastBillingPeriodSchema,default:()=>({})},
 newCharges:{type:newChargesSchema,default:()=>({})},

 supplyCharges:{type:supplyChargesSchema,default:()=>({})},
 deliveryCharges:{type:deliveryChargesSchema,default:()=>({})},

 billAttachment:{type:String},
 notes:{type:[String],default:[]}

},{timestamps:true,collection:"electricity_rates"});


// virtual: difference between budget and actual billed
electricityRateSchema.virtual("billedDifference").get(function(){
 return (this.actualBilledToDate||0)-(this.budgetBilledToDate||0);
});


// virtual: previous balance = last bill - payments
electricityRateSchema.virtual("previousBalance").get(function(){
 return (this.lastBillingPeriod?.totalCharges||0)-(this.lastBillingPeriod?.payments||0);
});


// virtual: total billing period = budget + late - discount
electricityRateSchema.virtual("totalBillingPeriod").get(function(){
 return (this.newCharges?.budgetBilledAmount||0)
  +(this.newCharges?.lateCharges||0)
  -(this.newCharges?.eapDiscount||0);
});


// virtual: total due = previous balance + current period
electricityRateSchema.virtual("totalDue").get(function(){
 const prev=(this.lastBillingPeriod?.totalCharges||0)-(this.lastBillingPeriod?.payments||0);
 const current=(this.newCharges?.budgetBilledAmount||0)
  +(this.newCharges?.lateCharges||0)
  -(this.newCharges?.eapDiscount||0);
 return prev+current;
});


const ElectricityRate=mongoose.models.ElectricityRate||mongoose.model("ElectricityRate",electricityRateSchema);
export default ElectricityRate;