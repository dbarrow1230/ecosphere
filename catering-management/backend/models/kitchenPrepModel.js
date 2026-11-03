import mongoose from "mongoose";

const kitchenPrepSchema=new mongoose.Schema({
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 order:{type:mongoose.Schema.Types.ObjectId,ref:"Order",default:null},
 menu:{type:mongoose.Schema.Types.ObjectId,ref:"Menu",default:null},
 menuItem:{type:mongoose.Schema.Types.ObjectId,ref:"MenuItem",default:null},
 dishName:{type:String,trim:true,default:""},
 prepItem:{type:String,required:true,trim:true},
 station:{type:mongoose.Schema.Types.ObjectId,ref:"Station",required:true},
 quantity:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 priority:{type:String,enum:["low","normal","high","urgent"],default:"normal"},
 status:{type:String,enum:["pending","in-progress","completed","cancelled"],default:"pending"},
 assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 dueDate:{type:Date},
 completedAt:{type:Date},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"kitchen_prep"});

const KitchenPrep=mongoose.models.KitchenPrep||mongoose.model("KitchenPrep",kitchenPrepSchema);

export default KitchenPrep;