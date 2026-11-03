import mongoose from "mongoose";
import businessInfoConnection from "../../db/businessInfoConnection.js";

const {Schema}=mongoose;

const productPackageSchema=new Schema({
 containerType:{type:String,trim:true,default:"jar"},
 sizeLabel:{type:String,trim:true,default:""},
 netWeight:{type:Number,default:0,min:0},
 netWeightUnit:{type:String,trim:true,default:"oz"},
 unitsPerCase:{type:Number,default:1,min:1},
 labelTemplateRef:{type:Schema.Types.ObjectId,ref:"ReceiptTemplate",default:null}
},{_id:false});

const productLabelSchema=new Schema({
 ingredientStatement:{type:String,trim:true,default:""},
 allergens:[{type:String,trim:true}],
 nutritionNotes:{type:String,trim:true,default:""},
 storageInstructions:{type:String,trim:true,default:""},
 warningStatement:{type:String,trim:true,default:""}
},{_id:false});

const productSchema=new Schema({
 business_id:{type:Schema.Types.ObjectId,ref:"Business",required:true,index:true},
 productName:{type:String,required:true,trim:true,index:true},
 sku:{type:String,trim:true,default:""},
 productType:{
  type:String,
  enum:["jam","jelly","preserve","pickle","mayonnaise","sauce","chutney","ferment","freezeDried","cheese","seasonal","other"],
  default:"preserve",
  index:true
 },
 recipeRef:{type:Schema.Types.ObjectId,ref:"Recipe",default:null,index:true},
 categoryRef:{type:Schema.Types.ObjectId,ref:"Category",default:null},
 description:{type:String,trim:true,default:""},
 package:productPackageSchema,
 label:productLabelSchema,
 shelfLifeDays:{type:Number,default:0,min:0},
 targetFoodCostPercent:{type:Number,default:0,min:0},
 suggestedRetailPrice:{type:Number,default:0,min:0},
 wholesalePrice:{type:Number,default:0,min:0},
 status:{type:String,enum:["draft","active","seasonal","paused","retired"],default:"draft",index:true},
 isActive:{type:Boolean,default:true,index:true},
 notes:[{type:String,trim:true}]
},{timestamps:true,collection:"products"});

productSchema.index({business_id:1,productName:1},{unique:true});
productSchema.index({business_id:1,sku:1},{sparse:true});

export default businessInfoConnection.models.Product||businessInfoConnection.model("Product",productSchema);
