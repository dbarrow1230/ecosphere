import mongoose from "mongoose";

const schema=new mongoose.Schema({
 name:{type:String,trim:true,required:true},
 description:{type:String,trim:true,default:""},
 quantity:{type:Number,min:0,default:1},
 vendor:{type:String,trim:true,default:""},
 unitCost:{type:Number,min:0,default:0},
 warranty:{type:String,trim:true,default:""},
 currency:{type:String,trim:true,default:"USD"},
 purchased:{type:Boolean,default:false},
 totalCost:{type:Number,min:0,default:0}
},{timestamps:true,collection:"garden_wishlist"});

schema.pre("validate",function(){
 this.totalCost=this.quantity*this.unitCost;
});

export default mongoose.models.GardenWish||mongoose.model("GardenWish",schema);
