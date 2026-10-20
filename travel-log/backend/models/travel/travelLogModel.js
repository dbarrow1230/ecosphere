import mongoose from "mongoose";
import {logFields} from "../../../src/config/travelFields.js";

const fields = {};
for (const field of [...logFields.travel,...logFields.hiking]) {
 fields[field.name] = field.type === "number"
  ? {type:Number,min:field.min,max:field.max,default:null}
  : {type:String,trim:true,default:"",maxlength:field.type === "textarea" ? 20000 : 500,required:!!field.required};
}
fields.date.validate = {
 validator:value=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value,
 message:"Enter a valid date."
};
const schema = new mongoose.Schema({
 ...fields,
 kind:{type:String,enum:["travel","hiking"],required:true},
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true}
},{timestamps:true,collection:"travelLogs"});
schema.index({user:1,kind:1,date:-1});
export default mongoose.models.TravelLog || mongoose.model("TravelLog",schema);
