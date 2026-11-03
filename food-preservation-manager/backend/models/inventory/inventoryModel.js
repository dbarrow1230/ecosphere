// backend/models/inventory/inventoryModel.js
import mongoose from "mongoose";

const inventorySchema=new mongoose.Schema({
 name:{type:String,trim:true,default:""},
 category:{type:String,trim:true,default:""},
 sku:{type:String,trim:true,default:""},
 quantityOnHand:{type:Number,default:0},
 reorderLevel:{type:Number,default:0},
 unit:{type:String,trim:true,default:""},
 costPerUnit:{type:Number,default:0},
 supplier:{type:String,trim:true,default:""},
 status:{type:String,enum:["in-stock","low","out-of-stock","discontinued"],default:"in-stock"},

 product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",default:null},
 productBatch:{type:mongoose.Schema.Types.ObjectId,ref:"ProductBatch",default:null},
 storageLocation:{type:mongoose.Schema.Types.ObjectId,ref:"StorageLocation"},

 quantities:{
  onHand:{type:Number,default:0},
  reserved:{type:Number,default:0},
  available:{type:Number,default:0},
  damaged:{type:Number,default:0},
  discarded:{type:Number,default:0}
 },

 workflowStatus:{type:mongoose.Schema.Types.ObjectId,ref:"Status"},

 dates:{
  stockedDate:{type:Date},
  lastMovementDate:{type:Date}
 },

 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"inventory"});

inventorySchema.pre("validate",function(){
 if(this.quantityOnHand!==undefined)this.quantities.onHand=Number(this.quantityOnHand||0);
 const onHand=Number(this.quantities?.onHand||0);
 const reserved=Number(this.quantities?.reserved||0);
 this.quantities.available=Math.max(onHand-reserved,0);
});

const Inventory=mongoose.models.Inventory||mongoose.model("Inventory",inventorySchema);

export default Inventory;
