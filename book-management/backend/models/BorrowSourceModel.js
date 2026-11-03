// backend/models/BorrowSourceModel.js
import mongoose from "mongoose";

const BorrowSourceModelSchema=new mongoose.Schema({
 name:{type:String,trim:true,required:true,unique:true,index:true},
 type:{type:String,trim:true,enum:["Library","Person","School","Archive","Subscription","Other"],default:"Other",index:true},
 website:{type:String,trim:true,default:""},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"borrow_sources"});

BorrowSourceModelSchema.pre("validate",function(){
 this.name=(this.name||"").trim();
 this.type=(this.type||"Other").trim();
 this.website=(this.website||"").trim();
 this.notes=(this.notes||"").trim();
});

const BorrowSourceModel=mongoose.models.BorrowSource||mongoose.model("BorrowSource",BorrowSourceModelSchema);

export default BorrowSourceModel;