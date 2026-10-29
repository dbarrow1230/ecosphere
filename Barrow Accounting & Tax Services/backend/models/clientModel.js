import mongoose from "mongoose";

const clientSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 firstName:{type:String,required:true,trim:true},
 lastName:{type:String,required:true,trim:true},
 company:{type:String,trim:true,default:""},
 email:{type:String,required:true,trim:true,lowercase:true},
 phone:{type:String,required:true,trim:true},
 altPhone:{type:String,trim:true,default:""},
 address1:{type:String,trim:true,default:""},
 address2:{type:String,trim:true,default:""},
 city:{type:String,trim:true,default:""},
 state:{type:mongoose.Schema.Types.ObjectId,ref:"State",default:null},
 country:{type:mongoose.Schema.Types.ObjectId,ref:"Country",default:null},
 postalCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active"},
 assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"clients"});

export default mongoose.models.AccountingClient||mongoose.model("AccountingClient",clientSchema);
