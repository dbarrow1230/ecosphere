import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateNutrition} from './nutrition.js';
const food=(fdcId,nutrients)=>({fdcId,foodNutrients:nutrients.map(([id,amount,unitName])=>({nutrient:{id,unitName},amount}))});
test('weights and servings scale nutrients, retaining real zero',()=>{
 const result=calculateNutrition([{fdcId:1,grams:200},{fdcId:2,grams:50}],2,[food(1,[[1008,100,'kcal'],[1003,10,'g'],[1093,0,'mg']]),food(2,[[1008,200,'kcal'],[1003,20,'g'],[1093,0,'mg']])]);
 assert.equal(result.nutrition.calories,'150');assert.equal(result.nutrition.protein,'15 g');assert.equal(result.nutrition.sodium,'0 mg');
});
test('missing data does not become zero or a partial total',()=>{
 const result=calculateNutrition([{fdcId:1,grams:100},{fdcId:2,grams:100}],1,[food(1,[[1003,10,'g']]),food(2,[])]);
 assert.equal(result.nutrition.protein,'');assert.ok(result.missing.includes('protein'));
});
test('uses alternate calorie measurement and micrograms',()=>{
 const result=calculateNutrition([{fdcId:1,grams:100}],1,[food(1,[[2048,230,'kcal'],[1106,20,'UG']])]);
 assert.equal(result.nutrition.calories,'230');assert.equal(result.nutrition.vitaminA,'20 µg');
});
test('invalid amounts, servings, and absent foods are rejected',()=>{
 assert.throws(()=>calculateNutrition([{fdcId:1,grams:100}],0,[]));
 assert.throws(()=>calculateNutrition([{fdcId:1,grams:-1}],1,[]));
 assert.throws(()=>calculateNutrition([{fdcId:1,grams:100}],1,[]));
});
