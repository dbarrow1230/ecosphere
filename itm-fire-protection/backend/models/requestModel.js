import mongoose from "mongoose";

const text=(required=false)=>({type:String,trim:true,maxlength:5000,required});
const requestSchema=new mongoose.Schema({
 kind:{type:String,enum:["service","quote","contact"],required:true},
 company:text(),name:text(true),phone:{...text(),required(){return this.kind!=="contact";}},
 email:{...text(true),lowercase:true,match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/},
 address:text(),property:text(),service:text(),equipment:text(),
 quantity:{type:Number,min:1,validate:{validator:value=>value==null||Number.isInteger(value),message:"Quantity must be a whole number"}},
 details:text(),subject:{...text(),required(){return this.kind==="contact";}},message:text(),
 status:{type:String,enum:["new","reviewing","closed"],default:"new"}
},{timestamps:true,collection:"itm_requests"});

export default mongoose.models.ItmRequest||mongoose.model("ItmRequest",requestSchema);
