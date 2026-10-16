import test from 'node:test';
import assert from 'node:assert/strict';
import {pricePayload,buildPriceUpdate} from '../../shared/culinary/vendorHistory.js';
test('uncategorized vendor products save null optional references',()=>{
 const payload=pricePayload({productCategory:'',imperialUnit:'ounce',metricUnit:'',imperialQuantity:5,metricQuantity:null,packCost:3.99,unitCost:0});
 assert.equal(payload.productCategory,null);assert.equal(payload.metricUnit,null);assert.equal(payload.imperialUnit,'ounce');assert.equal(payload.packCost,3.99);
});
test('category edits preserve price history and omitted categories',()=>{
 const existing={business:'business',vendor:'vendor',ingredient:'ingredient',productCategory:'category',packCost:3.99};
 assert.equal(Object.hasOwn(pricePayload({packCost:3.99}),'productCategory'),false);
 assert.equal(pricePayload({productCategory:'category'}).productCategory,'category');
 const update=buildPriceUpdate(existing,{productCategory:''});assert.equal(update.$set.productCategory,null);assert.equal(update.$push,undefined);
});
