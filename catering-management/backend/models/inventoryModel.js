// backend/models/inventoryModel.js
import mongoose from "mongoose";

const inventorySchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true},
 subcategory:{type:String,trim:true,default:""},
 sku:{type:String,trim:true,default:""},
 barcode:{type:String,trim:true,default:""},
 description:{type:String,trim:true,default:""},
 quantityOnHand:{type:Number,default:0,min:0},
 committedQuantity:{type:Number,default:0,min:0},
 reorderLevel:{type:Number,default:0,min:0},
 reorderQuantity:{type:Number,default:0,min:0},
 unit:{type:String,required:true,trim:true},
 purchaseUnit:{type:String,trim:true,default:""},
 conversionFactor:{type:Number,default:1,min:0},
 costPerUnit:{type:Number,default:0,min:0},
 lastPurchaseCost:{type:Number,default:0,min:0},
 supplier:{type:String,trim:true,default:""},
 supplierItemNumber:{type:String,trim:true,default:""},
 storageLocation:{type:String,trim:true,default:""},
 storageZone:{type:String,trim:true,default:""},
 shelfLifeDays:{type:Number,default:0,min:0},
 expirationTracking:{type:Boolean,default:false},
 lotTracking:{type:Boolean,default:false},
 isAllergen:{type:Boolean,default:false},
 allergenNotes:{type:String,trim:true,default:""},
 parLevel:{type:Number,default:0,min:0},
 minimumLevel:{type:Number,default:0,min:0},
 maximumLevel:{type:Number,default:0,min:0},
 countFrequency:{type:String,trim:true,default:"Weekly"},
 status:{type:String,enum:["in-stock","low","out-of-stock","discontinued"],default:"in-stock"},
 notes:{type:String,trim:true,default:""}
},{
 timestamps:true,
 collection:"inventory"
});

const Inventory=mongoose.models.Inventory||mongoose.model("Inventory",inventorySchema);

export default Inventory;
