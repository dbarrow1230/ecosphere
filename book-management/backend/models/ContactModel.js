// backend/models/ContactModel.js
import mongoose from "mongoose";

const ContactModelSchema=new mongoose.Schema({

 name:{type:String,trim:true,required:true,index:true},
 phone:{type:String,trim:true,default:"",validate:{validator:function(v){return v===""||/^\+?[0-9\s\-().]{7,20}$/.test(v);},message:"Invalid phone number"}},
 email:{type:String,trim:true,lowercase:true,default:"",validate:{validator:function(v){return v===""||/^\S+@\S+\.\S+$/.test(v);},message:"Invalid email address"}},
 notes:[{type:String,trim:true}],
 isActive:{type:Boolean,default:true}

},{
 timestamps:true,
 collection:"contacts"
});

const ContactModel=mongoose.models.Contact||mongoose.model("Contact",ContactModelSchema);

export default ContactModel;
