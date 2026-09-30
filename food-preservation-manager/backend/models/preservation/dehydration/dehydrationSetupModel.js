// backend/models/dehydrationSetupModel.js
import mongoose from "mongoose";

const d=v=>v==null?v:mongoose.Types.Decimal128.fromString(String(v));

const minMaxDecimalSchema=new mongoose.Schema({
 min:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 max:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
},{_id:false});

const dateTimeRangeSchema=new mongoose.Schema({
 minDate:{type:Date},
 minTime:{type:String,trim:true,default:""},
 maxDate:{type:Date},
 maxTime:{type:String,trim:true,default:""}
},{_id:false});

const scheduleItemSchema=new mongoose.Schema({
 date:{type:Date},
 time:{type:String,trim:true,default:""},
 action:{type:String,trim:true,default:""}
},{_id:false});

const prepItemSchema=new mongoose.Schema({
 step:{type:Number,default:0},
 date:{type:Date},
 time:{type:String,trim:true,default:""},
 action:{type:String,trim:true,default:""},
 preparation:{type:String,trim:true,default:""}
},{_id:false});

const beforeDehydrationPriceSchema=new mongoose.Schema({
 pounds:{
  weight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },
 ounces:{
  weight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },
 grams:{
  weight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 }
},{_id:false});

const afterDehydrationPriceSchema=new mongoose.Schema({
 pounds:{
  weightAfterDehydration:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },
 ounces:{
  weightAfterDehydration:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 },
 grams:{
  weightAfterDehydration:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  pricePerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  totalPrice:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
 }
},{_id:false});

const costSummaryRowSchema=new mongoose.Schema({
 method:{type:String,trim:true,default:""},
 wattage:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 energyUsedKwh:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 energyCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
},{_id:false});

const equivalentRowSchema=new mongoose.Schema({
 freshAmount:{type:String,trim:true,default:""},
 driedEquivalent:{type:String,trim:true,default:""},
 equivalentLb:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 equivalentOz:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
 equivalentGrams:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
},{_id:false});

const dehydrationSetupSchema=new mongoose.Schema({
 item:{type:String,trim:true,required:true},
 dehydrator:{type:mongoose.Schema.Types.ObjectId,ref:"Dehydrator"},
 fuelSource:{type:mongoose.Schema.Types.ObjectId,ref:"FuelSource"},

 dehydrationMethods:{
  dehydratorMethod:{
   suggestedTemperatureRange:{type:String,trim:true,default:"95–115°F (35–46°C)"},
   estimatedDuration:{type:String,trim:true,default:""},
   estimatedEnergyConsumption:minMaxDecimalSchema,
   estimatedEnergyCost:minMaxDecimalSchema,
   estimatedEndDateTime:dateTimeRangeSchema
  },
  ovenMethod:{
   temperature:{type:String,trim:true,default:""},
   estimatedTime:{type:String,trim:true,default:""},
   energyConsumption:minMaxDecimalSchema,
   estimatedEnergyCost:minMaxDecimalSchema,
   estimatedEndDateTime:dateTimeRangeSchema
  }
 },

 predictedWeightAfterDehydration:{
  expectedWeightLoss:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  predictedWeight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
  predictedFinalWeight:minMaxDecimalSchema
 },

 totalCostSummary:[costSummaryRowSchema],

 marketPriceCalculationDefaults:{
  beforeDehydration:beforeDehydrationPriceSchema,
  afterDehydration:afterDehydrationPriceSchema,
  costPerUnitCalculation:{
   totalCost:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
   totalWeight:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d},
   costPerUnit:{type:mongoose.Schema.Types.Decimal128,default:()=>mongoose.Types.Decimal128.fromString("0"),set:d}
  }
 },

 defaultSchedules:{
  dehydratorSchedule:[scheduleItemSchema],
  ovenSchedule:[scheduleItemSchema]
 },

 preparationInstructions:[prepItemSchema],

 storageInstructions:{
  instructions:[{type:String,trim:true}],
  shelfLife:{
   roomTemperature:{type:String,trim:true,default:""},
   freezer:{type:String,trim:true,default:""},
   powder:{type:String,trim:true,default:""}
  }
 },

 rehydrationInstructions:{type:String,trim:true,default:""},
 equivalentsTable:[equivalentRowSchema],
 finalNotes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive","paused","completed","cancelled"],default:"active"},
 isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"dehydration_setups"});

dehydrationSetupSchema.pre("validate",function(){
 if(!this.status)this.status=this.isActive===false?"inactive":"active";
 if(this.status==="inactive")this.isActive=false;
 if(this.status==="active")this.isActive=true;
});

const DehydrationSetup=mongoose.models.DehydrationSetup||mongoose.model("DehydrationSetup",dehydrationSetupSchema);

export default DehydrationSetup;
