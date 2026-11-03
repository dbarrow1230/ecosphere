import mongoose from 'mongoose';import fs from 'node:fs';
await mongoose.connect(process.env.MONGO_BUSINESS_URI);
try{
 const db=mongoose.connection.db,collection=db.collection('product_categories'),categories=await collection.find({}).sort({_id:1}).toArray(),offers=await db.collection('vendor_ingredient_prices').find({productCategory:{$ne:null}}).toArray();
 const byId=new Map(categories.map(item=>[String(item._id),item])),groups=new Map(),canonical=new Map();
 for(const item of categories){const key=item.name.trim().toLocaleLowerCase();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
 for(const group of groups.values())for(const item of group)canonical.set(String(item._id),group[0]._id);
 const mapId=value=>value?canonical.get(String(value))||value:null;
 const plans=[...groups.entries()].map(([nameKey,group])=>{const first=group[0],links=new Map();for(const item of group)for(const parent of item.parents?.length?item.parents:[item.parent||null]){const mapped=mapId(parent);if(String(mapped)!==String(first._id))links.set(String(mapped||''),mapped);}return {record:first,nameKey,parents:[...links.values()],duplicates:group.slice(1)};});
 const graph=new Map(plans.map(plan=>[String(plan.record._id),plan.parents.filter(Boolean).map(String)]));function check(id,path=new Set()){if(path.has(id))throw Error('Merging would create a category cycle.');for(const parent of graph.get(id)||[])check(parent,new Set([...path,id]));}for(const id of graph.keys())check(id);
 const pathFor=item=>{const path=[],seen=new Set();while(item&&!seen.has(String(item._id))){seen.add(String(item._id));path.unshift(item._id);item=byId.get(String(item.parent||item.parents?.[0]||''));}return path;};
 fs.writeFileSync('.local-backups/reusable-categories-2026-10-14.json',JSON.stringify({categories,offers},null,2));
 for(const index of await collection.indexes())if(index.unique&&('parent'in index.key||index.key.name||index.key.slug))await collection.dropIndex(index.name);
 for(const offer of offers){const originalPath=offer.productCategoryPath?.length?offer.productCategoryPath:pathFor(byId.get(String(offer.productCategory)));const mappedPath=originalPath.map(mapId).filter((value,index,all)=>index===0||String(value)!==String(all[index-1]));await db.collection('vendor_ingredient_prices').updateOne({_id:offer._id},{$set:{productCategory:mapId(offer.productCategory),productCategoryPath:mappedPath}});}
 for(const plan of plans){await collection.updateOne({_id:plan.record._id},{$set:{nameKey:plan.nameKey,parents:plan.parents,parent:plan.parents[0]||null}});if(plan.duplicates.length)await collection.deleteMany({_id:{$in:plan.duplicates.map(item=>item._id)}});}
 await collection.createIndex({nameKey:1},{unique:true,sparse:true});console.log(JSON.stringify({categoriesBefore:categories.length,categoriesAfter:plans.length,duplicateRecordsMerged:categories.length-plans.length,productPathsPreserved:offers.length}));
}finally{await mongoose.disconnect();}
