import {test} from 'node:test';import assert from 'node:assert/strict';import {nutritionInputsChanged} from './recipeUpdatePolicy.js';
const existing={servings:4,ingredients:[{ingredient:'abc',metricQuantity:100,metricUnit:'grams',note:'old'}]};
test('unrelated edits do not recalculate nutrition',()=>{assert.equal(nutritionInputsChanged(existing,{name:'New name'}),false);assert.equal(nutritionInputsChanged(existing,{ingredients:[{...existing.ingredients[0],note:'new',vendor:'vendor'}]}),false);});
test('quantity and serving changes recalculate nutrition',()=>{assert.equal(nutritionInputsChanged(existing,{servings:8}),true);assert.equal(nutritionInputsChanged(existing,{ingredients:[{...existing.ingredients[0],metricQuantity:200}]}),true);});
test('same numbers and populated IDs are unchanged',()=>{assert.equal(nutritionInputsChanged(existing,{servings:'4',ingredients:[{...existing.ingredients[0],ingredient:{_id:'abc'},metricQuantity:'100'}]}),false);});
