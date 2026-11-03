import mongoose from "mongoose";

const fleetingNoteSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
 domainId:{type:mongoose.Schema.Types.ObjectId,ref:"Domain",default:null,index:true},
 projectId:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null,index:true},
 projectIds:{type:[{type:mongoose.Schema.Types.ObjectId,ref:"Project"}],default:[]},
 topic:{type:String,default:"",trim:true},
 fleetingNoteId:{type:String,required:true,trim:true},
 rawCapture:{type:String,required:true,trim:true},
 captureType:{type:String,default:"idea",trim:true},
 subjectCode:{type:String,default:"",trim:true,uppercase:true},
 possibleProject:{type:[{type:String,trim:true}],default:[]},
 processLaterAs:{type:String,default:"",trim:true,uppercase:true},
 notes:{type:[{type:String,trim:true}],default:[]},
 status:{type:String,enum:["active","processed","archived","discarded"],default:"active",index:true},
 processedInto:{type:String,default:"",trim:true},
 hideFromInbox:{type:Boolean,default:false,index:true}
},{timestamps:true,collection:"fleeting_notes"});

fleetingNoteSchema.index({userId:1,fleetingNoteId:1},{unique:true});
fleetingNoteSchema.index({userId:1,status:1,hideFromInbox:1,createdAt:-1});
fleetingNoteSchema.index({userId:1,projectIds:1});

const FleetingNote=mongoose.model("FleetingNote",fleetingNoteSchema);

export default FleetingNote;
