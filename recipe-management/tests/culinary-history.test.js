import test from "node:test";
import assert from "node:assert/strict";
import {buildPriceUpdate,previewCosting} from "../../shared/culinary/vendorHistory.js";
const units=[{_id:"kg",symbol:"kg"},{_id:"g",symbol:"g"}];
const old={_id:"p",business:"b",ingredient:"i",vendor:"v",brand:"Brand",sku:"SKU",packCost:10,unitCost:.01,metricQuantity:1,metricUnit:"kg",effectiveDate:"2026-01-01"};
test("history snapshots retain pack, product and effective-date details",()=>{
 const update=buildPriceUpdate(old,{packCost:12,priceHistory:[]});
 assert.equal(update.$push.priceHistory.packCost,10);assert.equal(update.$push.priceHistory.sku,"SKU");assert.equal(update.$push.priceHistory.metricQuantity,1);assert.equal(update.$push.priceHistory.effectiveDate,"2026-01-01");
 assert.equal(update.$set.priceHistory,undefined);assert.equal(update.$inc.__v,1);
 assert.equal(buildPriceUpdate(old,{packCost:10}).$push,undefined);
 assert.throws(()=>buildPriceUpdate(old,{ingredient:"other"}));
});
test("cost preview exposes differences without modifying saved costs",()=>{
 const recipe={_id:"r",business:"b",name:"Recipe",servings:2};
 const costing={ingredients:[{ingredient:"i",vendor:"v",vendorIngredientPrice:"p",metricQuantity:500,metricUnit:"g",totalCost:5}],totals:{ingredientCost:5,totalCost:7},pricing:{suggestedPrice:10,targetFoodCostPercent:30}};
 const before=JSON.stringify(costing);
 const preview=previewCosting(recipe,costing,[{...old,packCost:12}],units);
 assert.equal(preview.estimatedIngredientCost,6);assert.equal(preview.estimatedTotal,8);assert.equal(preview.difference,1);assert.equal(preview.percent,20);assert.equal(preview.actualFoodCostPercent,60);assert.equal(preview.reviewRequired,true);
 assert.equal(JSON.stringify(costing),before);
 assert.equal(previewCosting(recipe,costing,[],units).estimatedTotal,null);
});

test("explicit ingredient corrections preserve previous product identity and declarations",()=>{
 const existing={...old,allergenInformation:{version:1,declarations:[{allergen:"milk",status:"present"}]}};
 const update=buildPriceUpdate(existing,{ingredient:"correct",reassignIngredient:true});assert.equal(update.$set.ingredient,"correct");assert.equal(update.$push.priceHistory.ingredient,"i");assert.equal(update.$push.priceHistory.vendor,"v");assert.equal(update.$set.allergenInformation,null);assert.equal(update.$push.allergenHistory.ingredient,"i");assert.throws(()=>buildPriceUpdate(existing,{vendor:"other",reassignIngredient:true}));
});
