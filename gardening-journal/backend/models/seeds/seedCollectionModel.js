// backend/models/seeds/seedCollectionModel.js
import mongoose from "mongoose";

const {Schema}=mongoose;

const seedCollectionSchema=new Schema({

	seed:{type:Schema.Types.ObjectId,ref:"Seed",required:true},
	dateCollected:{type:Date,default:null},
	seedCount:{type:Number,default:null},
	amountUnit:{type:String,trim:true,default:"seeds"},
	sourceType:{type:String,trim:true,enum:["harvested","store_item","gifted","purchased","traded","saved","other"],default:"harvested"},
	sourceName:{type:String,trim:true,default:""},
	vendor:{type:Schema.Types.ObjectId,ref:"SeedVendor",default:null},
	labelColor:{type:String,trim:true,default:"#0f7d4f"},
	notes:[{type:String,trim:true}],
    status:{type:String,trim:true,enum:["collected","stored","planted","archived"],default:"collected"},
	user:{type:Schema.Types.ObjectId,ref:"User",required:true}

},{timestamps:true,collection:"seed_collections"});

const SeedCollection=mongoose.models.SeedCollection||mongoose.model("SeedCollection",seedCollectionSchema);

export default SeedCollection;
