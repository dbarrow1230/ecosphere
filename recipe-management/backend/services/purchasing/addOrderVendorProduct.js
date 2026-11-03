import {createHash} from 'node:crypto';
import {cleanIngredientName} from '../../../../shared/culinary/ingredientRows.js';
import {idOf,unitDefinition} from '../../../../shared/culinary/pricing.js';
export async function addOrderVendorProduct(db,ObjectId,{business,vendor,line,effectiveDate}){
 const supplier=await db.collection('vendors').findOne({_id:vendor,isActive:{$ne:false}});if(!supplier)throw Error('Choose an active vendor.');
 const name=cleanIngredientName(line.productName);if(!name)throw Error('Item name is required.');const price=Number(line.unitCost||0);if(!Number.isFinite(price)||price<0)throw Error('Enter a valid price.');
 const key=name.toLowerCase().trim()+'|'+(line.purchaseUnit||'pack');
 const ingredients=await db.collection('ingredients').find({$or:[{business},{business:null},{business:{$exists:false}}],recordType:{$nin:['label','instruction']}}).toArray();
 let ingredient=ingredients.find(item=>String(item.name||item.ingredientName||'').trim().toLowerCase()===name.toLowerCase()&&item.isActive!==false);
 const now=new Date();
 if(!ingredient){const ingredientId=new ObjectId(createHash('sha256').update(idOf(business)+':order-item:'+name.toLowerCase()).digest('hex').slice(0,24));await db.collection('ingredients').updateOne({_id:ingredientId},{$setOnInsert:{_id:ingredientId,business,name,ingredientName:name,unit:line.purchaseUnit&&line.purchaseUnit!=='pack'?line.purchaseUnit:'each',recordType:'ingredient',isActive:true,isCostingIngredient:true,createdAt:now,updatedAt:now}},{upsert:true});ingredient=await db.collection('ingredients').findOne({_id:ingredientId});}
 const existing=await db.collection('vendor_ingredient_prices').find({business,vendor,ingredient:ingredient._id,isActive:{$ne:false}}).toArray();if(existing.length===1)return existing[0];const imported=existing.find(item=>item.orderImportKey===key);if(imported)return imported;
 const imperial=await db.collection('imperial_units').find({isActive:{$ne:false}}).toArray(),metric=await db.collection('metric_units').find({isActive:{$ne:false}}).toArray();const definition=line.purchaseUnit!=='pack'?unitDefinition(line.purchaseUnit):null;const find=records=>records.find(record=>{const value=unitDefinition(record);return value&&definition&&value.dimension===definition.dimension&&value.factor===definition.factor;});const imperialUnit=find(imperial),metricUnit=!imperialUnit?find(metric):null;
 const date=effectiveDate?new Date(effectiveDate):now;if(Number.isNaN(date.getTime()))throw Error('Enter a valid effective date.');
 await db.collection('vendor_ingredient_prices').createIndex({business:1,vendor:1,orderImportKey:1},{unique:true,partialFilterExpression:{orderImportKey:{$type:'string'}}});
 const offer={_id:new ObjectId(),business,vendor,ingredient:ingredient._id,orderImportKey:key,packCost:price,unitCost:definition?price:0,effectiveDate:date,isActive:true,isPreferred:false,brand:'',packSizeName:'',imperialQuantity:imperialUnit?1:null,imperialUnit:imperialUnit?._id||null,metricQuantity:metricUnit?1:null,metricUnit:metricUnit?._id||null,needsDetails:true,priceHistory:[],createdAt:now,updatedAt:now,__v:0};
 try{await db.collection('vendor_ingredient_prices').updateOne({business,vendor,orderImportKey:key},{$setOnInsert:offer},{upsert:true});}catch(error){if(error.code!==11000)throw error;}
 return db.collection('vendor_ingredient_prices').findOne({business,vendor,orderImportKey:key});
}
