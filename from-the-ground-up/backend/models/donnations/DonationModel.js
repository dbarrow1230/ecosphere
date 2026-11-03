import mongoose from "mongoose";

const donationSchema=new mongoose.Schema({
 donor:{type:mongoose.Schema.Types.ObjectId,ref:"DonorContact",required:true},
 amount:{type:Number,required:true,min:1},
 frequency:{type:String,enum:["one-time","recurring"],default:"one-time"},
 message:{type:String,trim:true},
 status:{type:String,enum:["pending","completed","failed"],default:"pending"},
 paymentIntentId:{type:String}
},{timestamps:true,collection:"donations"});

const Donation=mongoose.model("Donation",donationSchema);

export default Donation;