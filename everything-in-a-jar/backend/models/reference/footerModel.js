import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const footerSchema=new mongoose.Schema({
 business_id:{type:mongoose.Schema.Types.ObjectId,required:true,index:true,ref:"Business"},
 seasonRef:{type:mongoose.Schema.Types.ObjectId,default:null,index:true,ref:"Season"},

 name:{type:String,required:true,trim:true},

 lines:{type:[String],default:[]},

 showDate:{type:Boolean,default:true},
 showTime:{type:Boolean,default:true},
 showCashier:{type:Boolean,default:false},

 isDefault:{type:Boolean,default:false,index:true},
 isActive:{type:Boolean,default:true,index:true},

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"footers"});

footerSchema.index({business_id:1,name:1},{unique:true});
footerSchema.index({business_id:1,seasonRef:1});
footerSchema.index({business_id:1,isDefault:1});
footerSchema.index({business_id:1,isActive:1});

const Footer=businessInfoConnection.models.Footer||businessInfoConnection.model("Footer",footerSchema);

export default Footer;