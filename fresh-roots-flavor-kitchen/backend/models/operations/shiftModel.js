import mongoose from "mongoose";

const shiftSchema=new mongoose.Schema({
 staff:{type:mongoose.Schema.Types.ObjectId,ref:"Staff",required:true,index:true},
 title:{type:String,required:true,trim:true},
 role:{type:String,trim:true,default:""},
 area:{type:String,enum:["boh","foh"],default:"boh",index:true},
 status:{type:String,enum:["Scheduled","Confirmed","On Call"],default:"Scheduled"},
 start:{type:Date,required:true,index:true},
 end:{type:Date,required:true,index:true},
 published:{type:Boolean,default:false,index:true}
},{timestamps:true,collection:"staff_shifts"});

const Shift=mongoose.models.Shift||mongoose.model("Shift",shiftSchema);
export default Shift;
