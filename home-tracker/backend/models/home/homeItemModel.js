import mongoose from "mongoose";

const homeItemSchema=new mongoose.Schema({
 business:{type:mongoose.Schema.Types.ObjectId,ref:"Business",default:null,index:true},
 name:{type:String,required:true,trim:true},
 brand:{type:String,trim:true,default:""},
 barcode:{type:String,trim:true,default:""},
 storageType:{type:String,enum:["pantry","fridge","freezer","household"],default:"pantry",index:true},
 category:{type:mongoose.Schema.Types.ObjectId,ref:"HomeCategory",default:null,index:true},
 location:{type:mongoose.Schema.Types.ObjectId,ref:"HomeLocation",default:null,index:true},
 quantity:{type:Number,default:1,min:0},
 minimumQuantity:{type:Number,default:0,min:0},
 parLevel:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:"each"},
 cost:{type:Number,default:0,min:0},
 purchaseDate:{type:Date,default:null},
 expirationDate:{type:Date,default:null,index:true},
 status:{type:String,enum:["active","used","expired","discarded","needed"],default:"active",index:true},
 shoppingList:{type:Boolean,default:false,index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"home_items"});

homeItemSchema.index({business:1,name:1});
homeItemSchema.index({name:"text",brand:"text",notes:"text"});

const HomeItem=mongoose.models.HomeItem||mongoose.model("HomeItem",homeItemSchema);

export default HomeItem;
