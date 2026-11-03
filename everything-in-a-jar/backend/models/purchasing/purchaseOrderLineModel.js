import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const purchaseOrderLineSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 purchaseOrderRef:{type:Schema.Types.ObjectId,ref:"PurchaseOrder",required:true,index:true},
 lineNumber:{type:Number,default:1,min:1},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 beverageVendorItemRef:{type:Schema.Types.ObjectId,ref:"BeverageVendorItem",default:null},
 uomRef:{type:Schema.Types.ObjectId,ref:"MetricUnit",default:null},
 quantityOrdered:{type:Number,default:0,min:0},
 quantityReceived:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 lineTotal:{type:Number,default:0,min:0},
 status:{type:String,enum:["open","partialReceived","received","cancelled"],default:"open",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"purchase_order_lines"});

purchaseOrderLineSchema.index({business_id:1,purchaseOrderRef:1,lineNumber:1},{unique:true});

export default businessInfoConnection.models.PurchaseOrderLine||businessInfoConnection.model("PurchaseOrderLine",purchaseOrderLineSchema);
