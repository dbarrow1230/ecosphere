import mongoose from "mongoose";
const schema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 name:{type:String,required:true,trim:true,maxLength:200},
 type:{type:String,enum:["camera","lens","lighting","tripod","accessory"],required:true},
 brand:{type:String,trim:true,default:"",maxLength:200},
 model:{type:String,trim:true,default:"",maxLength:200},
 serialNumber:{type:String,trim:true,default:"",maxLength:200},
 purchaseDate:{type:Date,default:null},
 purchasePrice:{type:Number,min:0,default:null},
 description:{type:String,trim:true,default:"",maxLength:10000}
},{timestamps:true,collection:"photography_equipment"});
export default mongoose.models.PhotoEquipment||mongoose.model("PhotoEquipment",schema);
