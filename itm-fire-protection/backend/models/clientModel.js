import mongoose from "mongoose";

const text={type:String,trim:true,default:""};

const schema=new mongoose.Schema({
    name:{...text,required:true},
    clientId:{type:String,trim:true,required:true,unique:true,index:true},
    firstName:text,
    lastName:text,
    company:text,
    accountType:{type:mongoose.Schema.Types.ObjectId,ref:"ItmAccountType",default:null},
    contactTitle:text,
    email:{...text,lowercase:true},
    phone:text,
    altPhone:text,
    website:text,
    address1:text,
    address2:text,
    city:text,
    postalCode:text,
    state:{type:mongoose.Schema.Types.ObjectId,default:null},
    country:{type:mongoose.Schema.Types.ObjectId,default:null},
    billingContact:text,
    billingAddress1:text,
    billingAddress2:text,
    billingCity:text,
    billingPostalCode:text,
    billingState:{type:mongoose.Schema.Types.ObjectId,default:null},
    billingCountry:{type:mongoose.Schema.Types.ObjectId,default:null},
    propertyName:text,
    propertyType:text,
    siteContact:text,
    accessInstructions:text,
    taxExempt:{type:Boolean,default:false},
    taxId:text,
    customerSince:{type:Date,default:Date.now},
    serviceFrequency:text,
    lastServiceDate:{type:Date,default:null},
    nextServiceDate:{type:Date,default:null},
    notes:text,
    status:{type:String,enum:["active","inactive"],default:"active"}
},{timestamps:true,collection:"itm_clients",optimisticConcurrency:true});

schema.index({name:1});
schema.index({company:1});

export default mongoose.models.ItmClient||mongoose.model("ItmClient",schema);