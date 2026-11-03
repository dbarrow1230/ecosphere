import mongoose from "mongoose";

const text={type:String,trim:true,default:""},date={type:Date,default:null};

const extinguisherSchema=new mongoose.Schema({
    name:{...text,required:true},
    serialNumber:{type:String,trim:true,uppercase:true,required:true},
    manufacturer:text,
    modelNumber:text,
    agentType:text,
    capacity:text,
    rating:text,
    location:{...text,required:true},
    manufactureDate:date,
    installDate:date,
    lastInspectionDate:date,
    lastServiceDate:date,
    lastHydrostaticTest:date,
    nextInspectionDate:date,
    nextMaintenanceDate:date,
    nextHydrostaticTest:date,
    status:{type:String,enum:["in-service","needs-service","out-of-service","retired"],default:"in-service"},
    notes:text
},{_id:true});

const schema=new mongoose.Schema({
    clientRef:{type:mongoose.Schema.Types.ObjectId,ref:"ItmClient",required:true,unique:true,index:true},
    extinguishers:{type:[extinguisherSchema],default:[]},
    notes:text
},{timestamps:true,collection:"itm_client_inventory",optimisticConcurrency:true});

schema.index({"extinguishers.serialNumber":1});
schema.index({"extinguishers.location":1});
schema.index({"extinguishers.nextInspectionDate":1});
schema.index({"extinguishers.nextHydrostaticTest":1});

export default mongoose.models.ItmClientInventory||mongoose.model("ItmClientInventory",schema);