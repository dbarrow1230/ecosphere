import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const ingredientSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 name:{type:String,required:true,trim:true,index:true},
 ingredientType:{type:String,enum:["produce","spice","sweetener","acid","dairy","egg","oil","packaging","supply","other"],default:"produce",index:true},
 sku:{type:String,trim:true,default:""},
 defaultUnit:{type:String,trim:true,default:""},
 storageRequirement:{type:String,trim:true,default:""},
 allergenFlags:[{type:String,trim:true}],
 isPerishable:{type:Boolean,default:true,index:true},
 shelfLifeDays:{type:Number,default:0,min:0},
 reorderPoint:{type:Number,default:0,min:0},
 parLevel:{type:Number,default:0,min:0},
 preferredVendorRef:{type:Schema.Types.ObjectId,ref:"Vendor",default:null},
 notes:{type:String,trim:true,default:""},
 isActive:{type:Boolean,default:true,index:true}
},{timestamps:true,collection:"ingredients"});

ingredientSchema.index({business_id:1,name:1},{unique:true});

export default businessInfoConnection.models.Ingredient||businessInfoConnection.model("Ingredient",ingredientSchema);
