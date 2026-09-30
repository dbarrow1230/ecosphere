import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRecipeText} from './parseRecipeText.js';

test('GPT mixed fractions, indented flavor fields, and hyphenated CCP references',()=>{
 const {recipe:r}=parseRecipeText(`Recipe Name: Bajan Seasoning Paste
Cuisine: Barbadian
Course: Condiment
Category: Seasoning Paste
Yield: Approximately 1 1/8 cups (270 g)
Serving Size: Approximately 1 tablespoon (15 g)
Flavor Profile:
\tTaste: Fresh, savory
\tAroma: Fresh herbs, garlic
\tMouthfeel: Thick, moist
General Description:
Seasoning paste.
Ingredients
Imperial\tMetric\tIngredient\tPreparation\tTime
1 oz\t30 g\tFresh cilantro\tChopped\t3 minutes
Instructions
1. Refrigerate. CCP-1: Keep cold.
Plating:
Serve.
`);
 assert.equal(r.yield.imperialQuantity,1.125);
 assert.equal(r.yield.metricQuantity,270);
 assert.equal(r.yield.imperialUnitName,'cups');
 assert.equal(r.servingSize.imperialQuantity,1);
 assert.equal(r.servingSize.imperialUnitName,'tablespoon');
 assert.equal(r.servingSize.metricQuantity,15);
 assert.equal(r.servings,null);
 assert.deepEqual(r.flavorProfile.aroma,['Fresh herbs','garlic']);
 assert.deepEqual(r.flavorProfile.mouthfeel,['Thick','moist']);
 assert.deepEqual(r.instructions[0].ccpRefs,['CCP-1']);
 assert.deepEqual(r.allergens,[]);
 assert.equal(r.ingredients.length,1);
});

test('existing servings, dual units, and explicit allergen sections still parse',()=>{
 const {recipe:r}=parseRecipeText('Recipe Name: Test\nYield: 8 servings\nServing Size: 1/2 cup / 120 ml\nAllergen Disclaimer:\nMilk: Contains milk.');
 assert.equal(r.servings,8);
 assert.equal(r.servingSize.imperialQuantity,0.5);
 assert.equal(r.servingSize.metricQuantity,120);
 assert.ok(r.allergens.includes('Milk'));
});
