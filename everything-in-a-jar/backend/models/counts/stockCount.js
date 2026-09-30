import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const stockCountSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 countNumber:{type:String,required:true,trim:true,index:true},
 locationRef:{type:Schema.Types.ObjectId,ref:"Location",default:null,index:true},
 status:{type:String,enum:["draft","inProgress","submitted","approved","posted"],default:"draft",index:true},
 countDate:{type:Date,default:Date.now,index:true},
 createdByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedByRef:{type:Schema.Types.ObjectId,ref:"User",default:null},
 approvedAt:{type:Date,default:null},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"stock_counts"});

stockCountSchema.index({business_id:1,countNumber:1},{unique:true});

export default businessInfoConnection.models.StockCount||businessInfoConnection.model("StockCount",stockCountSchema);
