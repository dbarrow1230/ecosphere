// backend/models/supplies/supplyModel.js
import mongoose from "mongoose";

const {Schema}=mongoose;

const supplySchema=new Schema({
	name:{type:String,required:true,trim:true},
	description:{type:String,trim:true,default:""},
	category:{type:Schema.Types.ObjectId,ref:"SupplyCategory",default:null},
	vendor:{type:Schema.Types.ObjectId,ref:"SupplyVendor",default:null},
	brand:{type:String,trim:true,default:""},
	type:{type:String,trim:true,default:""},
	quantity:{type:Number,default:0},
	unit:{type:String,trim:true,default:""},
	purchaseDate:{type:Date,default:null},
	purchasePrice:{type:Number,default:0},
	notes:{type:String,trim:true,default:""},
	images:[{type:String,trim:true}],
	createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"supplies"});

const Supply=mongoose.models.Supply||mongoose.model("Supply",supplySchema);

export default Supply;