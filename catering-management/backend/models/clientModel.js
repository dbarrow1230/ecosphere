// backend/models/clientModel.js
import mongoose from "mongoose";

const clientSchema=new mongoose.Schema({
 name:{type:String, required:true,trim:true},
 firstName:{type:String,required:true,trim:true},
 lastName:{type:String,required:true,trim:true},
 company:{type:String,trim:true,default:""},
 clientType:{type:String,trim:true,default:"Individual"},
 email:{type:String,required:true,trim:true,lowercase:true},
 phone:{type:String,required:true,trim:true},
 altPhone:{type:String,trim:true,default:""},
 preferredContactMethod:{type:String,trim:true,default:"Email"},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State"},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country"},
 postalCode:{type:String,trim:true,default:""},
 billingContactName:{type:String,trim:true,default:""},
 billingEmail:{type:String,trim:true,lowercase:true,default:""},
 billingPhone:{type:String,trim:true,default:""},
 taxExempt:{type:Boolean,default:false},
 taxExemptNumber:{type:String,trim:true,default:""},
 defaultServiceType:{type:String,trim:true,default:""},
 dietaryRequirements:{type:String,trim:true,default:""},
 allergies:{type:String,trim:true,default:""},
 favoriteMenus:{type:String,trim:true,default:""},
 deliveryInstructions:{type:String,trim:true,default:""},
 paymentTerms:{type:String,trim:true,default:""},
 referralSource:{type:String,trim:true,default:""},
 lastEventDate:{type:Date,default:null},
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true, collection:"clients"});

const Client=mongoose.models.Client||mongoose.model("Client",clientSchema);

export default Client;
