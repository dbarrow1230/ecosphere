import test from "node:test";
import assert from "node:assert/strict";
import {enrichNutrition,ingredientGrams} from "../backend/services/automaticNutrition.js";
import {nutritionInputsChanged} from "../backend/services/recipeUpdatePolicy.js";
import {costLine} from "../../shared/culinary/pricing.js";
const item={ingredient:{_id:"flour",name:"Flour"},metricQuantity:100,metricUnit:{_id:"g",name:"Gram",symbol:"g"},vendor:"vendor",vendorIngredientPrice:"offer"};
test("vendor selection and cost edits preserve USDA nutrition input signatures",()=>{
 const existing={servings:2,ingredients:[item]};assert.equal(nutritionInputsChanged(existing,{ingredients:[{...item,vendorIngredientPrice:"new",unitCost:3,totalCost:6}]}),false);
 assert.equal(nutritionInputsChanged(existing,{ingredients:[{...item,metricQuantity:200}]}),true);assert.equal(nutritionInputsChanged(existing,{servings:4}),true);
});
test("nutrition processing accepts priced recipe lines and remains mockable without API calls",async()=>{
 const food={fdcId:123,description:"Flour",foodNutrients:[{nutrient:{id:1008,name:"Energy",unitName:"kcal"},amount:364},{nutrient:{id:1003,name:"Protein",unitName:"g"},amount:10}],foodPortions:[]};
 const calls=[];const result=await enrichNutrition({servings:2,ingredients:[item]},async(endpoint)=>{calls.push(endpoint);return endpoint==="foods/search"?{foods:[food]}:food;});
 assert.equal(result.status,"complete");assert.equal(result.matches[0].grams,100);assert.deepEqual(calls,["foods/search","food/123"]);assert.equal(ingredientGrams(item,food),100);
});
test("scaling measured ingredient quantities scales compatible vendor costs",()=>{
 const offer={metricQuantity:1,metricUnit:{symbol:"kg"},packCost:10};const original=costLine(item,offer);const doubled=costLine({...item,metricQuantity:item.metricQuantity*2},offer);assert.equal(doubled.totalCost,original.totalCost*2);
});
