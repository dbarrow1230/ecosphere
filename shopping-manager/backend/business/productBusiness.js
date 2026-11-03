// /backend/business/productBusiness.js
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Store from "../models/storeModel.js";
import Unit from "../models/unitModel.js";

const ensureRef=async(Model,id,label)=>{
 if(!id) return null;
 const doc=await Model.findById(id).lean();
 if(!doc) throw new Error(`${label} not found`);
 return doc;
};

export const validateProductRefs=async(payload={})=>{
 await ensureRef(Category,payload.category,"Category");
 if(payload.brand) await ensureRef(Brand,payload.brand,"Brand");
 if(payload.unit) await ensureRef(Unit,payload.unit,"Unit");
 if(payload.defaultStore) await ensureRef(Store,payload.defaultStore,"Store");
 return true;
};

export const ensureUniqueProductFields=async(payload={},excludeId=null)=>{
 const checks=[];
 if(payload.sku) checks.push({sku:payload.sku});
 if(payload.barcode) checks.push({barcode:payload.barcode});
 if(!checks.length) return true;
 for(const where of checks){
  const query={...where};
  if(excludeId) query._id={$ne:excludeId};
  const exists=await Product.findOne(query).lean();
  if(exists) throw new Error(`${Object.keys(where)[0]} already exists`);
 }
 return true;
};

export const createProductLogic=async(payload={})=>{
 await validateProductRefs(payload);
 await ensureUniqueProductFields(payload);
 const product=await Product.create(payload);
 return product;
};

export const updateProductLogic=async(productId,payload={})=>{
 const current=await Product.findById(productId);
 if(!current) throw new Error("Product not found");
 await validateProductRefs({...current.toObject(),...payload});
 await ensureUniqueProductFields(payload,productId);
 Object.assign(current,payload);
 await current.save();
 return current;
};

export default{
 validateProductRefs,
 ensureUniqueProductFields,
 createProductLogic,
 updateProductLogic
};