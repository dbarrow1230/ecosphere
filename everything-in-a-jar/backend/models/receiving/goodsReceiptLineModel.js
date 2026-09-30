import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const goodsReceiptLineSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 goodsReceiptRef:{type:Schema.Types.ObjectId,ref:"GoodsReceipt",required:true,index:true},
 purchaseOrderLineRef:{type:Schema.Types.ObjectId,ref:"PurchaseOrderLine",default:null},
 inventoryLotRef:{type:Schema.Types.ObjectId,ref:"InventoryLot",default:null,index:true},
 itemName:{type:String,required:true,trim:true,index:true},
 itemType:{type:String,enum:["ingredient","packaging","finishedProduct","marketSupply","beverage","other"],default:"ingredient",index:true},
 productRef:{type:Schema.Types.ObjectId,ref:"Product",default:null,index:true},
 ingredientRef:{type:Schema.Types.ObjectId,ref:"Ingredient",default:null,index:true},
 beverageItemRef:{type:Schema.Types.ObjectId,ref:"BeverageItem",default:null,index:true},
 lotNumber:{type:String,trim:true,default:""},
 quantityReceived:{type:Number,default:0,min:0},
 unit:{type:String,trim:true,default:""},
 unitCost:{type:Number,default:0,min:0},
 expirationDate:{type:Date,default:null},
 qualityStatus:{type:String,enum:["accepted","hold","rejected"],default:"accepted",index:true},
 notes:{type:String,trim:true,default:""}
},{timestamps:true,collection:"goods_receipt_lines"});

goodsReceiptLineSchema.index({business_id:1,goodsReceiptRef:1,itemName:1,lotNumber:1});

export default businessInfoConnection.models.GoodsReceiptLine||businessInfoConnection.model("GoodsReceiptLine",goodsReceiptLineSchema);
