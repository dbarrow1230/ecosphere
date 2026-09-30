// backend/models/product/productModel.js
import mongoose from "mongoose";

const productSchema=new mongoose.Schema(
 {
  name:{type:String,required:true},
  sku:{type:String},
  slug:{type:String},
  shortDescription:{type:String},
  longDescription:{type:String},

  preservationProject:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"PreservationProject"
  },

  category:{type:String},
  subcategory:{type:String},

  packagingDefaults:{
   containerType:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ContainerType"
   }
  },

  sellingControls:{
   isActive:{type:Boolean,default:true},
   availableOnline:{type:Boolean,default:true},
   availableInStore:{type:Boolean,default:true},
   featured:{type:Boolean,default:false}
  }
 },
 {timestamps:true}
);

const Product=mongoose.model("Product",productSchema);

export default Product;
export {Product};