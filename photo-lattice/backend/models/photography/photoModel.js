import mongoose from "mongoose";

const photoSchema=new mongoose.Schema({
 owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 title:{type:String,required:true,trim:true,maxLength:200},
 fileUrl:{type:String,required:true,trim:true,maxLength:2000},
 description:{type:String,trim:true,default:"",maxLength:10000},
 takenAt:{type:Date,default:null},
 location:{type:String,trim:true,default:"",maxLength:500},
 albumRefs:[{type:mongoose.Schema.Types.ObjectId,ref:"PhotoAlbum"}],
 tagRefs:[{type:mongoose.Schema.Types.ObjectId,ref:"PhotoTag"}],
 shootRef:{type:mongoose.Schema.Types.ObjectId,ref:"PhotoShoot",default:null},
 cameraRef:{type:mongoose.Schema.Types.ObjectId,ref:"PhotoEquipment",default:null},
 lensRef:{type:mongoose.Schema.Types.ObjectId,ref:"PhotoEquipment",default:null},
 aperture:{type:String,trim:true,default:"",maxLength:40},
 shutterSpeed:{type:String,trim:true,default:"",maxLength:40},
 iso:{type:Number,min:0,default:null},
 focalLength:{type:Number,min:0,default:null},
 rating:{type:Number,min:0,max:5,default:0,validate:Number.isInteger},
 favorite:{type:Boolean,default:false},
 status:{type:String,enum:["active","archived"],default:"active"}
},{timestamps:true,collection:"photography_photos"});
photoSchema.index({owner:1,status:1,takenAt:-1});
export default mongoose.models.Photo||mongoose.model("Photo",photoSchema);
