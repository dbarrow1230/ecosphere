import mongoose from 'mongoose';

const supplyVendorSchema=new mongoose.Schema({
	name:{type:String,trim:true,default:''},
	companyName:{type:String,trim:true,default:''},
	contactName:{type:String,trim:true,default:''},
	email:{type:String,trim:true,default:''},
	phone:{type:String,trim:true,default:''},
	website:{type:String,trim:true,default:''},
	address1:{type:String,trim:true,default:''},
	address2:{type:String,trim:true,default:''},
	city:{type:String,trim:true,default:''},
	state:{type:mongoose.Schema.Types.ObjectId,ref:'State',default:null},
	postalCode:{type:String,trim:true,default:''},
	country:{type:mongoose.Schema.Types.ObjectId,ref:'Country',default:null},
	isInternational:{type:Boolean,default:false},
	description:{type:String,trim:true,default:''},
	isActive:{type:Boolean,default:true}
},{timestamps:true,collection:"supply_vendors"});

const SupplyVendor=mongoose.models.SupplyVendor||mongoose.model('SupplyVendor',supplyVendorSchema);

export default SupplyVendor;