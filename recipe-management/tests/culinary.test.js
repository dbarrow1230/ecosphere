import test from "node:test";
import assert from "node:assert/strict";
import {applyPrice,costLine,offersFor,normalizeOffer,priceChange} from "../../shared/culinary/pricing.js";
const units=[{_id:"kg",symbol:"kg"},{_id:"g",symbol:"g"},{_id:"lb",symbol:"lb"},{_id:"ml",symbol:"ml"},{_id:"each",symbol:"each"}];
const offer={_id:"offer",business:"business",ingredient:"flour",vendor:"vendor",metricQuantity:1,metricUnit:"kg",packCost:4};
test("recipe quantities convert into the vendor pack basis",()=>{
 assert.equal(costLine({metricQuantity:250,metricUnit:"g"},offer,units).totalCost,1);
 assert.ok(Math.abs(costLine({imperialQuantity:1,imperialUnit:"lb"},offer,units).totalCost-1.81436948)<1e-8);
 assert.equal(costLine({metricQuantity:0,metricUnit:"g"},offer,units).totalCost,0);
});
test("incompatible and missing measurements never produce a valid zero cost",()=>{
 assert.ok(costLine({metricQuantity:250,metricUnit:"ml"},offer,units).error);
 assert.ok(costLine({metricQuantity:"",metricUnit:"g"},offer,units).error);
 assert.equal(normalizeOffer({...offer,metricQuantity:0},units),null);
});
test("offer comparison respects business and ingredient and retains free offers",()=>{
 const values=offersFor([offer,{...offer,_id:"other",business:"other"},{...offer,_id:"wrong",ingredient:"sugar"},{...offer,_id:"free",packCost:0}],{business:"business",ingredient:"flour"},units);
 assert.deepEqual(values.map(item=>item._id),["free","offer"]);
});
test("selection clears snapshots and rejects mismatched offerings",()=>{
 const line={ingredient:"flour",metricQuantity:250,metricUnit:"g"};
 const selected=applyPrice(line,offer,"business",units);
 assert.equal(selected.vendor,"vendor");assert.equal(selected.totalCost,1);
 assert.equal(applyPrice(selected,null,"business",units).vendorIngredientPrice,"");
 assert.ok(applyPrice(line,offer,"other",units).conversionError);
});
test("price change supports increases, decreases and a zero-price baseline",()=>{
 assert.deepEqual(priceChange(10,12),{difference:2,percent:20});
 assert.equal(priceChange(10,8).percent,-20);assert.equal(priceChange(0,5).percent,null);
});
