import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseFood,ingredientGrams,enrichNutrition} from './automaticNutrition.js';
test('matches unsalted butter and refuses ambiguous ingredients',()=>{
 assert.equal(chooseFood('unsalted butter',[{fdcId:1,description:'Butter, without salt'},{fdcId:2,description:'Butter, salted'}]).fdcId,1);
 assert.equal(chooseFood('flour',[{fdcId:1,description:'Flour wheat'},{fdcId:2,description:'Flour rice'}]),null);
 assert.equal(chooseFood('apple',[{fdcId:1,description:'Rose apples raw'}]),null);
});
test('uses mass or USDA portion weights, never assumes water density',()=>{
 assert.equal(ingredientGrams({metricQuantity:2,metricUnit:{name:'kilogram'}},{}),2000);
 const item={imperialQuantity:2,imperialUnit:{symbol:'tbsp'}};
 assert.equal(ingredientGrams(item,{foodPortions:[{modifier:'tbsp',amount:1,gramWeight:14}]}),28);
 assert.equal(ingredientGrams({metricQuantity:100,metricUnit:{symbol:'ml'}},{}),null);
});
test('automatic calculation requires no manual food selection',async()=>{
 const calls=[];
 const request=async endpoint=>{calls.push(endpoint);return endpoint==='foods/search'?{foods:[{fdcId:1,description:'Butter, without salt'}]}:{fdcId:1,description:'Butter, without salt',foodNutrients:[{nutrient:{id:1008,unitName:'kcal'},amount:700}]};};
 const result=await enrichNutrition({servings:2,ingredients:[{ingredient:{name:'unsalted butter'},metricQuantity:100,metricUnit:{symbol:'g'}}]},request);
 assert.equal(result.status,'complete');assert.equal(result.nutrition.calories,'350');assert.equal(result.matches[0].fdcId,1);assert.equal(calls.length,2);
});
test('unresolved ingredient does not replace stored nutrition with partial totals',async()=>{
 const result=await enrichNutrition({servings:2,ingredients:[{ingredient:{name:'mystery sauce'},metricQuantity:100,metricUnit:{symbol:'g'}}]},async()=>({foods:[]}));
 assert.equal(result.status,'needs_review');assert.equal(result.nutrition,undefined);assert.match(result.issues[0],/mystery sauce/);
});
