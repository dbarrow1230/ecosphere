import mongoose from "mongoose";

const text={type:String,trim:true,default:""};

const schema=new mongoose.Schema({
    name:{...text,required:true,unique:true},
    description:text,
    status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true,collection:"itm_account_types",optimisticConcurrency:true});

schema.index({name:1});

export default mongoose.models.ItmAccountType||mongoose.model("ItmAccountType",schema);