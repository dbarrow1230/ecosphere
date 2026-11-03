import mongoose from "mongoose";
const text={type:String,trim:true,default:""};
const checkSchema=new mongoose.Schema({label:{...text,required:true},result:{type:String,enum:["pending","pass","fail","not-applicable"],default:"pending"},notes:text},{_id:false});
const itemSchema=new mongoose.Schema({
 equipmentRef:{type:mongoose.Schema.Types.ObjectId,ref:"ItmInventory",required:true},
 snapshot:{name:text,serialNumber:text,manufacturer:text,modelNumber:text,category:text,location:text,agentType:text,capacity:text,rating:text},
 checks:{type:[checkSchema],default:[]},outcome:{type:String,enum:["pending","pass","fail","needs-service","replaced","retired"],default:"pending"},
 workPerformed:text,deficiencies:text,correctiveAction:text,partsUsed:text,tagNumber:text,
 nextInspectionDate:{type:Date,default:null},nextMaintenanceDate:{type:Date,default:null},nextHydrostaticTest:{type:Date,default:null}
},{_id:false});
const schema=new mongoose.Schema({
 clientRef:{type:mongoose.Schema.Types.ObjectId,ref:"ItmClient",required:true,index:true},
 serviceType:{type:String,enum:["inspection","maintenance","recharge","hydrostatic-test","repair","installation","replacement"],required:true},systemType:{type:String,default:"Portable Fire Extinguishers",trim:true},
 status:{type:String,enum:["draft","scheduled","in-progress","completed","cancelled"],default:"draft"},scheduledDate:{type:Date,default:null},serviceDate:{type:Date,default:null},technician:text,
 procedureReference:text,siteAddress:text,reason:text,notes:text,customerAcknowledgement:text,equipment:{type:[itemSchema],default:[]},
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null},completedAt:{type:Date,default:null}
},{timestamps:true,collection:"itm_service_records",optimisticConcurrency:true});
schema.index({clientRef:1,serviceDate:-1,createdAt:-1});
export default mongoose.models.ItmServiceRecord||mongoose.model("ItmServiceRecord",schema);
