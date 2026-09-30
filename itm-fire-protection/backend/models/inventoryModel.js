import mongoose from "mongoose";

const text={type:String,trim:true,default:""},date={type:Date,default:null};

const schema=new mongoose.Schema({
    name:{...text,required:true},
    kind:{type:String,enum:["equipment","supply"],default:"equipment"},
    category:{...text,required:true},
    sku:text,
    serialNumber:{type:String,trim:true,uppercase:true,default:undefined,required(){return this.kind==="equipment";}},
    manufacturer:text,
    modelNumber:text,
    agentType:text,
    capacity:text,
    rating:text,
    quantityOnHand:{type:Number,min:0,default:1},
    unit:{...text,default:"each"},
    reorderLevel:{type:Number,min:0,default:0},
    costPerUnit:{type:Number,min:0,default:0},
    supplier:text,
    clientRef:{type:mongoose.Schema.Types.ObjectId,ref:"ItmClient",default:null,index:true},
    location:text,
    manufactureDate:date,
    installDate:date,
    lastInspectionDate:date,
    lastServiceDate:date,
    lastHydrostaticTest:date,
    nextInspectionDate:date,
    nextMaintenanceDate:date,
    nextHydrostaticTest:date,
    status:{type:String,enum:["in-stock","in-service","needs-service","out-of-service","retired"],default:"in-stock"},
    notes:text
},{timestamps:true,collection:"itm_inventory",optimisticConcurrency:true});

schema.index({serialNumber:1},{unique:true,partialFilterExpression:{serialNumber:{$type:"string"}}});
schema.index({sku:1});
schema.index({category:1});

schema.pre("validate",function(){if(!this.serialNumber)this.serialNumber=undefined;if(this.kind==="equipment"&&this.quantityOnHand!==1)this.invalidate("quantityOnHand","Serialized equipment must have a quantity of one.");});

export default mongoose.models.ItmInventory||mongoose.model("ItmInventory",schema);