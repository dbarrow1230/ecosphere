import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import mongoose from "mongoose";
import {createCulinaryRouter} from "../../shared/culinary/router.js";
const oid=index=>new mongoose.Types.ObjectId(index.toString(16).padStart(24,"0"));
const ids={business:oid(1),other:oid(2),recipe:oid(3),otherRecipe:oid(4),ingredient:oid(5),offer:oid(6),vendor:oid(7),allergen:oid(8),menu:oid(9),event:oid(10),unit:oid(11),inventory:oid(12)};
const same=(a,b)=>a instanceof Date||b instanceof Date?new Date(a).getTime()===new Date(b).getTime():String(a)===String(b);
const values=(object,path)=>{const [head,...tail]=path.split(".");if(Array.isArray(object))return object.flatMap(item=>values(item,path));const value=object?.[head];return tail.length?values(value,tail.join(".")):[value];};
const matches=(row,query)=>Object.entries(query).every(([key,expected])=>{
 if(key==="$or")return expected.some(item=>matches(row,item));
 const actual=values(row,key);
 if(expected&&typeof expected==="object"&&!(expected instanceof mongoose.Types.ObjectId)&&!(expected instanceof Date))return Object.entries(expected).every(([operator,value])=>operator==="$exists"?actual.some(item=>item!==undefined)===value:operator==="$ne"?actual.every(item=>!same(item,value)):operator==="$in"?actual.some(item=>value.some(option=>same(item,option))):false);
 return actual.some(value=>same(value,expected));
});
const clone=value=>value instanceof mongoose.Types.ObjectId?value:value instanceof Date?new Date(value):Array.isArray(value)?value.map(clone):value&&typeof value==="object"?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)])):value;
const assign=(row,key,value)=>{const parts=key.split(".");let target=row;for(const part of parts.slice(0,-1)){target[part]??={};target=target[part];}target[parts.at(-1)]=clone(value);};
const database=initial=>{const data=clone(initial);return{data,collection:name=>{
 data[name]??=[];const rows=data[name];
 return{find:query=>({toArray:async()=>rows.filter(row=>matches(row,query)).map(clone),project:()=>({toArray:async()=>rows.filter(row=>matches(row,query)).map(clone)})}),findOne:async query=>clone(rows.find(row=>matches(row,query))||null),updateOne:async(query,update)=>{const row=rows.find(item=>matches(item,query));if(!row)return{matchedCount:0};for(const [key,value]of Object.entries(update.$set||{}))assign(row,key,value);for(const [key,value]of Object.entries(update.$push||{})){row[key]??=[];row[key].push(clone(value));}return{matchedCount:1};}};
 }};};
const fixture=()=>{
 const declaration={allergen:ids.allergen,status:"absent",source:"Supplier label",verifiedBy:"Reviewer",verifiedAt:new Date("2026-01-01")};
 const business=database({recipes:[{_id:ids.recipe,business:ids.business,name:"Recipe",servings:2,ingredients:[{ingredient:ids.ingredient,vendorIngredientPrice:ids.offer,metricQuantity:.5,metricUnit:ids.unit,totalCost:5}],allergens:[],updatedAt:new Date("2026-01-01")},{_id:ids.otherRecipe,business:ids.other,name:"Other recipe",ingredients:[]}],ingredients:[{_id:ids.ingredient,name:"Flour",allergenInformation:{version:1,declarations:[declaration]}}],vendor_ingredient_prices:[{_id:ids.offer,business:ids.business,ingredient:ids.ingredient,vendor:ids.vendor,metricQuantity:1,metricUnit:ids.unit,packCost:10,availablePacks:10,allergenInformation:{version:1,declarations:[declaration]}}],allergens:[{_id:ids.allergen,name:"Milk"}],metric_units:[{_id:ids.unit,symbol:"kg"}],vendors:[{_id:ids.vendor,legalName:"Vendor",purchasingTermsByBusiness:{[String(ids.business)]:{minimumOrder:0,deliveryCost:2}}}]});
 const local=database({menus:[{_id:ids.menu,name:"Menu"}],events:[{_id:ids.event,eventName:"Event",guestCount:10,quotedTotal:123,allergies:""}],inventory:[{_id:ids.inventory,name:"Stock",unit:"kg",quantityOnHand:1}]});
 const router=createCulinaryRouter({express,mongoose,businessConnection:{db:business,asPromise:async()=>{}},localConnection:{db:local},enableMenus:true,enableEvents:true});
 const call=(method,path,body={},businessId=ids.business)=>new Promise((resolve,reject)=>{
  let status=200;const parsed=new URL(path,"http://test.local");const query={...(businessId?{business:String(businessId)}:{}),...Object.fromEntries(parsed.searchParams)};
  const req={method,url:parsed.pathname,query,body,headers:{},params:{}};
  const res={status:value=>{status=value;return res;},json:payload=>resolve({status,payload:clone(payload)})};
  router.handle(req,res,error=>error?reject(error):resolve({status:404,payload:null}));
 });
 return{business,local,call};
};
test("culinary APIs require a business and reject recipes from other businesses",async()=>{
 const {call}=fixture();assert.equal((await call("GET","/options",{},null)).status,400);
 const options=await call("GET","/options");assert.equal(options.status,200);assert.equal(options.payload.recipes.length,1);assert.equal(options.payload.recipes[0].name,"Recipe");
 assert.equal((await call("GET",`/recipes/${ids.otherRecipe}/allergens`)).status,404);
});
test("menu links, event requirements and purchasing preserve quotes and isolate businesses",async()=>{
 const {call,local}=fixture();
 assert.equal((await call("PUT",`/menus/${ids.menu}/recipes`,{recipeAssignments:[{recipe:String(ids.otherRecipe),servingsPerGuest:1}]})).status,400);
 assert.equal((await call("PUT",`/menus/${ids.menu}/recipes`,{recipeAssignments:[{recipe:String(ids.recipe),servingsPerGuest:1}]})).status,200);
 assert.equal((await call("PUT",`/events/${ids.event}/menus`,{menuAssignments:[{menu:String(ids.menu),guests:10}],customerAllergens:[String(ids.allergen)]})).status,200);
 assert.equal((await call("PUT",`/menus/${ids.menu}/recipes`,{recipeAssignments:[]},ids.other)).status,400);
 const result=await call("POST","/purchasing/compare",{event:String(ids.event)});
 assert.equal(result.status,200);assert.equal(result.payload.multipleVendor.total,32,JSON.stringify(result.payload));assert.equal(result.payload.lines[0].requiredQuantity,2500);
 assert.equal(local.data.events[0].quotedTotal,123);
 const linked=await call("PUT",`/inventory/${ids.inventory}/ingredient`,{ingredient:String(ids.ingredient)});assert.equal(linked.status,200);
 const stocked=await call("POST","/purchasing/compare",{event:String(ids.event)});assert.equal(stocked.payload.multipleVendor.total,22);assert.equal(stocked.payload.lines[0].inventoryQuantity,1000);
});
test("allergen reviews invalidate after supplier declaration changes and preserve event snapshots",async()=>{
 const {call,business,local}=fixture();
 await call("PUT",`/menus/${ids.menu}/recipes`,{recipeAssignments:[{recipe:String(ids.recipe),servingsPerGuest:1}]});
 await call("PUT",`/events/${ids.event}/menus`,{menuAssignments:[{menu:String(ids.menu),guests:10}],customerAllergens:[String(ids.allergen)]});
 const before=await call("GET",`/recipes/${ids.recipe}/allergens`);assert.equal(before.payload.reviewRequired,false);
 const review=await call("POST",`/recipes/${ids.recipe}/allergen-review`,{reviewer:"Chef",fingerprint:before.payload.fingerprint});assert.equal(review.status,200);
 const reviewed=await call("GET",`/recipes/${ids.recipe}/allergens`);assert.equal(reviewed.payload.reviewCurrent,true);
 const event=await call("GET",`/events/${ids.event}/allergens`);
 assert.equal((await call("POST",`/events/${ids.event}/allergen-snapshot`,{reviewer:"Chef",fingerprint:event.payload.fingerprint})).status,201);
 const snapshot=JSON.stringify(local.data.events[0].allergenSnapshots[0]);
 const change=await call("PUT",`/allergens/offering/${ids.offer}`,{declarations:[{allergen:String(ids.allergen),status:"cross_contact",source:"New label",verifiedBy:"Chef",verifiedAt:"2026-02-01"}]});assert.equal(change.status,200);assert.equal(change.payload.affectedRecipes.length,1);
 assert.equal(business.data.vendor_ingredient_prices[0].allergenHistory.length,1);
 const changed=await call("GET",`/recipes/${ids.recipe}/allergens`);assert.equal(changed.payload.reviewCurrent,false);assert.notEqual(changed.payload.fingerprint,before.payload.fingerprint);
 const conflict=await call("GET",`/events/${ids.event}/allergens`);assert.equal(conflict.payload.conflicts[0].conflict,"Possible cross-contact");assert.equal(JSON.stringify(local.data.events[0].allergenSnapshots[0]),snapshot);assert.equal(local.data.events[0].quotedTotal,123);
 assert.equal((await call("POST",`/recipes/${ids.recipe}/allergen-review`,{reviewer:"Chef",fingerprint:before.payload.fingerprint})).status,400);
});


test("unlinked menu dishes prevent incomplete purchasing and cannot produce a reviewed menu",async()=>{
 const {call,local}=fixture();const dish=oid(13);
 local.data.menu_items=[{_id:dish,menu:ids.menu,name:"Dish"}];
 await call("PUT",`/menus/${ids.menu}/recipes`,{recipeAssignments:[]});
 const unknown=await call("GET",`/menus/${ids.menu}/allergens`);assert.equal(unknown.status,200);assert.equal(unknown.payload.reviewRequired,true);assert.ok(unknown.payload.issues.some(issue=>issue.includes("Dish")));
 assert.equal((await call("POST","/purchasing/compare",{menus:[{menu:String(ids.menu),guests:10}]})).status,400);
 assert.equal((await call("PUT",`/menu-items/${dish}/recipe`,{menu:String(ids.menu),recipe:String(ids.recipe),servingsPerGuest:1})).status,200);
 const known=await call("GET",`/menus/${ids.menu}/allergens`);assert.equal(known.payload.recipes[0].dishName,"Dish");assert.equal(known.payload.issues.length,0);
 const result=await call("POST","/purchasing/compare",{menus:[{menu:String(ids.menu),guests:10}]});assert.equal(result.payload.multipleVendor.total,32);
});
test("price history distinguishes pack-price increases from normalized unit-price decreases",async()=>{
 const {call,business}=fixture();business.data.vendor_ingredient_prices[0].priceHistory=[{packCost:8,metricQuantity:.5,metricUnit:ids.unit,effectiveDate:new Date("2026-01-01")}];
 const result=await call("GET",`/prices/${ids.offer}/history`);assert.equal(result.status,200);assert.equal(result.payload.versions[1].percent,25);assert.equal(result.payload.versions[1].normalizedChange.percent,-37.5);
});
test("vendor quantity terms cannot be silently cleared while editing delivery costs",async()=>{
 const {call,business}=fixture();business.data.vendors[0].ordering={minimumOrderValue:20,minimumOrderQty:3,orderMultiple:2};
 const missing=await call("PUT",`/vendors/${ids.vendor}/terms`,{minimumOrder:20,deliveryCost:5});assert.equal(missing.status,400);
 const confirmed=await call("PUT",`/vendors/${ids.vendor}/terms`,{minimumOrder:20,deliveryCost:5,minimumPacks:3,packMultiple:2});assert.equal(confirmed.status,200);
 const options=await call("GET","/options");assert.equal(options.payload.vendors[0].purchasingTerms.packMultiple,2);
});

test("selected recipe review excludes other recipes and unselected vendor products",async()=>{
 const {call,business}=fixture();
 business.data.recipes.push({_id:oid(20),business:ids.business,name:"Unrelated recipe",ingredients:[{ingredient:oid(21)}]});
 business.data.ingredients.push({_id:oid(21),name:"Unrelated ingredient"});
 business.data.vendor_ingredient_prices.push({...business.data.vendor_ingredient_prices[0],_id:oid(22),vendor:oid(23)});
 const scoped=await call("GET",`/options?recipe=${ids.recipe}`);assert.equal(scoped.status,200);assert.equal(scoped.payload.recipes.length,1);assert.equal(scoped.payload.ingredients.length,1);assert.deepEqual(scoped.payload.offers.map(item=>String(item._id)),[String(ids.offer)]);
 const costs=await call("GET",`/cost-review?recipe=${ids.recipe}`);assert.equal(costs.payload.length,1);assert.equal(costs.payload[0].recipe,String(ids.recipe));
 business.data.recipes[0].ingredients[0].vendorIngredientPrice=null;
 assert.equal((await call("GET",`/options?recipe=${ids.recipe}`)).payload.offers.length,0);
});
test("recipes without vendor assignments retain ingredient quantities and review rows",async()=>{
 const {call,business}=fixture();business.data.recipes[0].ingredients[0].vendorIngredientPrice=null;
 const result=await call("GET",`/options?recipe=${ids.recipe}`);
 assert.equal(result.status,200);assert.equal(result.payload.recipeIngredients.length,1);assert.equal(result.payload.recipeIngredients[0].name,"Flour");assert.equal(result.payload.recipeIngredients[0].quantity,"0.5 kg");assert.equal(result.payload.offers.length,0);
 assert.equal(result.payload.costReviews.length,1);assert.equal(result.payload.costReviews[0].lines.length,1);assert.match(result.payload.costReviews[0].lines[0].issue,/No vendor assigned/);assert.equal(result.payload.costReviews[0].complete,false);
});
