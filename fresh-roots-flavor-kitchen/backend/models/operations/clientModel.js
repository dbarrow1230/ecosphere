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
 state:{type:mongoose.Schema.Types.ObjectId,default:null},
 country:{type:mongoose.Schema.Types.ObjectId,default:null},
 postalCode:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""},
 status:{type:String,enum:["active","inactive"],default:"active",index:true}
},{timestamps:true,collection:"clients"});

clientSchema.index({email:1},{unique:true});
clientSchema.index({name:1});

const Client=mongoose.models.Client||mongoose.model("Client",clientSchema);

export default Client;
