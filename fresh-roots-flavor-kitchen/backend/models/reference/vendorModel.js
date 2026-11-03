// backend/models/reference/vendorModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const vendorContactSchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 title:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""}
},{_id:false});

const vendorAddressSchema=new mongoose.Schema({
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 countyRef:{type:mongoose.Schema.Types.ObjectId,ref:"County",default:null},
 countryRef:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 label:{type:String,trim:true,default:""},
 addressLine1:{type:String,trim:true,default:""},
 addressLine2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:String,trim:true,default:""},
 postalCode:{type:String,trim:true,default:""},
 country:{type:String,trim:true,default:""}
},{_id:false});

const vendorPaymentSchema=new mongoose.Schema({
 paymentTerms:{type:String,trim:true,default:""},
 preferredPaymentMethod:{type:String,trim:true,default:""},
 currencyCode:{type:String,trim:true,uppercase:true,default:""}
},{_id:false});

const vendorOrderingSchema=new mongoose.Schema({
 orderingEmail:{type:String,trim:true,lowercase:true,default:""},
 vendorPortalUrl:{type:String,trim:true,default:""},
 leadTimeDays:{type:Number,default:0},
 minimumOrderValue:{type:Number,default:0}
},{_id:false});

const vendorPerformanceSchema=new mongoose.Schema({
 rating:{type:Number,default:0},
 onTimeRate:{type:Number,default:0},
 fillRate:{type:Number,default:0}
},{_id:false});

const vendorComplianceSchema=new mongoose.Schema({
 taxId:{type:String,trim:true,default:""},
 insuranceExpiration:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const vendorSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 legalName:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:null},
 dbaName:{type:String,trim:true,default:""},
 vendorCategory:{type:String,trim:true,default:""},
 website:{type:String,trim:true,default:""},
 logo:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 fax:{type:String,trim:true,default:""},
 contacts:{type:[vendorContactSchema],default:[]},
 addresses:{type:[vendorAddressSchema],default:[]},
 payment:{type:vendorPaymentSchema,default:{}},
 ordering:{type:vendorOrderingSchema,default:{}},
 performance:{type:vendorPerformanceSchema,default:{}},
 compliance:{type:vendorComplianceSchema,default:{}},
 isPreferred:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"vendors"});

vendorSchema.index({business_id:1,legalName:1},{unique:true});
vendorSchema.index({business_id:1,code:1},{unique:true,sparse:true});
vendorSchema.index({business_id:1,isActive:1});

const Vendor=businessInfoConnection.models.Vendor||businessInfoConnection.model("Vendor",vendorSchema);

export default Vendor;
