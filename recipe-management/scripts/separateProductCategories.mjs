import mongoose from 'mongoose';
import fs from 'node:fs';
await mongoose.connect(process.env.MONGO_BUSINESS_URI);
try{
 const db=mongoose.connection.db,categories=await db.collection('vendor_categories').find({}).toArray();
 const roots=categories.filter(item=>item.name==='Produce');const ids=new Set(roots.map(item=>String(item._id)));let changed=true;while(changed){changed=false;for(const category of categories){if(ids.has(String(category.parent))&&!ids.has(String(category._id))){ids.add(String(category._id));changed=true;}}}
 const products=categories.filter(item=>ids.has(String(item._id)));if(!products.some(item=>item.name==='Mushrooms'))throw Error('Expected product hierarchy not found');
 const offers=await db.collection('vendor_ingredient_prices').find({vendorCategory:{$exists:true}}).toArray();
 fs.writeFileSync('.local-backups/product-category-separation-2026-10-14.json',JSON.stringify({categories:products,offers},null,2));
 for(const category of products)await db.collection('product_categories').updateOne({_id:category._id},{$setOnInsert:category},{upsert:true});
 for(const offer of offers){const productCategory=ids.has(String(offer.vendorCategory))?offer.vendorCategory:null;await db.collection('vendor_ingredient_prices').updateOne({_id:offer._id},{$set:{productCategory},$unset:{vendorCategory:''}});}
 const linkedVendor=await db.collection('vendors').findOne({vendorCategory:{$in:[...products.map(item=>item._id),...products.map(item=>item.name)]}});
 if(!linkedVendor)await db.collection('vendor_categories').deleteMany({_id:{$in:products.map(item=>item._id)}});
 console.log(JSON.stringify({productCategories:products.length,offersSeparated:offers.length,vendorTypeReferencesPreserved:true}));
}finally{await mongoose.disconnect();}
