//backend/models/core/clientBusinessModel.js
import mongoose from "mongoose";

const contactSchema=new mongoose.Schema({
 firstName:{type:String,trim:true,default:""},
 lastName:{type:String,trim:true,default:""},
 role:{type:String,trim:true,default:""},
 email:{type:String,trim:true,lowercase:true,default:""},
 phone:{type:String,trim:true,default:""},
 isPrimary:{type:Boolean,default:false}
},{_id:false});

const addressSchema=new mongoose.Schema({
 label:{type:String,trim:true,default:""},
 line1:{type:String,trim:true,default:""},
 line2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 postalCode:{type:String,trim:true,default:""}
},{_id:false});

const clientBusinessSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 displayName:{type:String,trim:true,default:""},
 legalName:{type:String,trim:true,default:""},

 primaryContact:{
  firstName:{type:String,trim:true,default:""},
  lastName:{type:String,trim:true,default:""},
  email:{type:String,trim:true,lowercase:true,default:""},
  phone:{type:String,trim:true,default:""}
 },

 contacts:[contactSchema],
 addresses:[addressSchema],

 communication:{
  preferredMethod:{type:String,enum:["email","phone","text","other"],default:"email"},
  notes:{type:String,trim:true,default:""}
 },

 status:{type:String,enum:["lead","active","inactive","archived"],default:"lead"},
 stage:{type:String,enum:["inquiry","discussion","proposal","active","completed","paused"],default:"inquiry"},

 tags:[{type:String,trim:true}],
 notes:{type:String,trim:true,default:""},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 isActive:{type:Boolean,default:true}

},{timestamps:true,collection:"client_businesses"});

clientBusinessSchema.index({name:1});
clientBusinessSchema.index({status:1});
clientBusinessSchema.index({stage:1});
clientBusinessSchema.index({"primaryContact.email":1});

const ClientBusiness=mongoose.models.ClientBusiness||mongoose.model("ClientBusiness",clientBusinessSchema);

export default ClientBusiness;