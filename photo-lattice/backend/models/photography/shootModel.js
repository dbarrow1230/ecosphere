import mongoose from "mongoose";
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 name:{type:String,required:true,trim:true,maxLength:200},
 description:{type:String,trim:true,default:"",maxLength:10000},
 startsAt:{type:Date,required:true},
 endsAt:{type:Date,default:null},
 location:{type:String,trim:true,default:"",maxLength:500},
 client:{type:String,trim:true,default:"",maxLength:200},
 status:{type:String,enum:["planned","completed","cancelled"],default:"planned"},
 equipmentRefs:[{type:mongoose.Schema.Types.ObjectId,ref:"PhotoEquipment"}]
},{timestamps:true,collection:"photography_shoots"});
export default mongoose.models.PhotoShoot||mongoose.model("PhotoShoot",schema);
