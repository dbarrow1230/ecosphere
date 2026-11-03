//backend/models/reference/vendorModel.js
import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const vendorContactSchema=new mongoose.Schema({
 firstName:{type:String,trim:true,default:""},
 lastName:{type:String,trim:true,default:""},
 fullName:{type:String,trim:true,default:""},
 jobTitle:{type:String,trim:true,default:""},
 department:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 mobile:{type:String,trim:true,default:""},
 fax:{type:String,trim:true,default:""},
 isPrimary:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{_id:true});

const vendorAddressSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:"Main"},
 attention:{type:String,trim:true,default:""},
 addressLine1:{type:String,trim:true,default:""},
 addressLine2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 stateRef:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null,index:true},
 countyRef:{type:mongoose.Schema.Types.ObjectId,ref:"County",default:null,index:true},
 countryRef:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null,index:true},
 postalCode:{type:String,trim:true,default:""},
 isPrimary:{type:Boolean,default:false},
 isRemitTo:{type:Boolean,default:false},
 isShipFrom:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{_id:true});

const vendorPaymentSchema=new mongoose.Schema({
 paymentTerms:{type:String,trim:true,default:""},
 preferredPaymentMethod:{type:String,trim:true,default:""},
 currencyCode:{type:String,trim:true,uppercase:true,default:"USD"},
 creditLimit:{type:Number,default:0,min:0},
 taxId:{type:String,trim:true,default:""},
 registrationNumber:{type:String,trim:true,default:""},
 accountNumber:{type:String,trim:true,default:""},
 remitEmail:{type:String,trim:true,lowercase:true,default:""},
 remitPhone:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const vendorOrderingSchema=new mongoose.Schema({
 vendorPortalUrl:{type:String,trim:true,default:""},
 orderingEmail:{type:String,trim:true,lowercase:true,default:""},
 orderingPhone:{type:String,trim:true,default:""},
 poDeliveryMethod:{type:String,trim:true,default:"email"},
 acceptsStandingOrders:{type:Boolean,default:false},
 acceptsReturns:{type:Boolean,default:false},
 returnWindowDays:{type:Number,default:0,min:0},
 leadTimeDays:{type:Number,default:0,min:0},
 emergencyLeadTimeDays:{type:Number,default:0,min:0},
 averageTurnaroundDays:{type:Number,default:0,min:0},
 orderCutoffTime:{type:String,trim:true,default:""},
 orderDays:{type:[String],default:[]},
 deliveryDays:{type:[String],default:[]},
 minimumOrderValue:{type:Number,default:0,min:0},
 minimumOrderQty:{type:Number,default:0,min:0},
 orderMultiple:{type:Number,default:1,min:1},
 allowsBackOrders:{type:Boolean,default:true},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const vendorPerformanceSchema=new mongoose.Schema({
 rating:{type:Number,default:0,min:0,max:5},
 qualityRating:{type:Number,default:0,min:0,max:5},
 serviceRating:{type:Number,default:0,min:0,max:5},
 priceRating:{type:Number,default:0,min:0,max:5},
 onTimeRate:{type:Number,default:0,min:0,max:100},
 fillRate:{type:Number,default:0,min:0,max:100},
 defectRate:{type:Number,default:0,min:0,max:100},
 averageResponseHours:{type:Number,default:0,min:0},
 lastOrderAt:{type:Date,default:null},
 lastDeliveryAt:{type:Date,default:null},
 lastReturnAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const vendorComplianceSchema=new mongoose.Schema({
 insuranceExpiryDate:{type:Date,default:null},
 liquorLicenseNumber:{type:String,trim:true,default:""},
 liquorLicenseExpiryDate:{type:Date,default:null},
 foodSafetyCertification:{type:String,trim:true,default:""},
 foodSafetyExpiryDate:{type:Date,default:null},
 isApproved:{type:Boolean,default:false},
 approvedAt:{type:Date,default:null},
 approvedByRef:{type:mongoose.Schema.Types.ObjectId,default:null,ref:"User"},
 notes:{type:String,trim:true,default:""}
},{_id:false});

const vendorSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},

 legalName:{type:String,required:true,trim:true},
 code:{type:String,trim:true,uppercase:true,default:""},
 dbaName:{type:String,trim:true,default:""},
vendorCategories:[{type:mongoose.Schema.Types.ObjectId,ref:"VendorCategory"}],
 website:{type:String,trim:true,default:""},
 logo:{type:String,trim:true,default:""},

 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 fax:{type:String,trim:true,default:""},

 supportsIngredients:{type:Boolean,default:false,index:true},
 supportsEquipment:{type:Boolean,default:false},
 supportsPackaging:{type:Boolean,default:false},
 supportsServices:{type:Boolean,default:false},

 contacts:{type:[vendorContactSchema],default:[]},
 addresses:{type:[vendorAddressSchema],default:[]},

 payment:{type:vendorPaymentSchema,default:()=>({})},
 ordering:{type:vendorOrderingSchema,default:()=>({})},
 performance:{type:vendorPerformanceSchema,default:()=>({})},
 compliance:{type:vendorComplianceSchema,default:()=>({})},

 preferredContactRef:{type:mongoose.Schema.Types.ObjectId,default:null},
 primaryAddressRef:{type:mongoose.Schema.Types.ObjectId,default:null},

 isPreferred:{type:Boolean,default:false,index:true},
 isActive:{type:Boolean,default:true,index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"vendors"});

vendorSchema.index({business_id:1,legalName:1},{unique:true});
vendorSchema.index({business_id:1,code:1},{unique:true,sparse:true});
vendorSchema.index({business_id:1,vendorCategories:1});
vendorSchema.index({business_id:1,isPreferred:1});
vendorSchema.index({business_id:1,isActive:1});
vendorSchema.index({business_id:1,supportsIngredients:1});
vendorSchema.index({business_id:1,foodServiceOnly:1});
vendorSchema.index({"contacts.email":1});
vendorSchema.index({"ordering.orderingEmail":1});

const Vendor=businessInfoConnection.models.Vendor||businessInfoConnection.model("Vendor",vendorSchema);

export default Vendor;
