//backend/models/foundation/MediaAssetModel.js
import mongoose from "mongoose";

const mediaAssetSchema=new mongoose.Schema({
 modelType:{type:String,trim:true,default:""},
 recordId:{type:mongoose.Schema.Types.ObjectId,default:null},

 title:{type:String,trim:true,default:""},
 altText:{type:String,trim:true,default:""},
 caption:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},

 fileName:{type:String,required:true,trim:true},
 originalName:{type:String,trim:true,default:""},
 fileUrl:{type:String,required:true,trim:true},
 filePath:{type:String,trim:true,default:""},
 mimeType:{type:String,trim:true,default:""},
 extension:{type:String,trim:true,default:""},

 mediaType:{type:String,enum:["image","video","audio","document","spreadsheet","other"],default:"image"},
 fileSize:{type:Number,default:0,min:0},

 width:{type:Number,default:0,min:0},
 height:{type:Number,default:0,min:0},
 duration:{type:Number,default:0,min:0},

 tags:[{type:String,trim:true}],
 folder:{type:String,trim:true,default:""},
 sortOrder:{type:Number,default:0},

 isPrimary:{type:Boolean,default:false},
 isPublic:{type:Boolean,default:false},
 isActive:{type:Boolean,default:true},

 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},
 updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true,collection:"media_assets"});

mediaAssetSchema.index({modelType:1,recordId:1});
mediaAssetSchema.index({mediaType:1});
mediaAssetSchema.index({fileName:1});
mediaAssetSchema.index({isPrimary:1});
mediaAssetSchema.index({isActive:1});

const MediaAsset=mongoose.models.MediaAsset||mongoose.model("MediaAsset",mediaAssetSchema);

export default MediaAsset;