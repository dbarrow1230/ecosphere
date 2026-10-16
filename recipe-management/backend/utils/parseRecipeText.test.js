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

test('complete Mango Coulis source preserves all recipe sections and exact quantities',async()=>{const {readFile}=await import('node:fs/promises');const source=await readFile(new URL('../../tests/fixtures/mango-coulis.txt',import.meta.url),'utf8');const r=parseRecipeText(source).recipe;assert.equal(r.name,'Mango Coulis');assert.equal(r.yield.imperialQuantity,2);assert.equal(r.yield.metricQuantity,475);assert.equal(r.servings,8);assert.equal(r.servingSize.imperialQuantity,.25);assert.equal(r.servingSize.metricQuantity,60);assert.equal(r.ingredients.length,5);assert.equal(r.ingredients[3].imperialQuantity,.25);assert.equal(r.ingredients[4].imperialQuantity,.125);assert.equal(r.times.totalTime,'50 minutes');assert.ok(r.flavorProfile.taste.length);assert.ok(r.flavorProfile.aroma.length);assert.ok(r.flavorProfile.mouthfeel.length);for(const key of ['generalDescription','menuDescription','origin','history','culturalSignificance','suggestedPriceDisplay'])assert.ok(r[key].length,key);assert.match(r.suggestedPriceDisplay,/2.50/);assert.equal(r.dietaryConsiderationNames.length,5);assert.equal(r.equipmentNames.length,13);assert.equal(r.techniques.length,8);assert.equal(r.haccp.length,7);assert.equal(r.ccp.length,2);assert.equal(r.instructions.length,10);assert.deepEqual(r.instructions[7].ccpRefs,['CCP-1']);assert.deepEqual(r.instructions[8].ccpRefs,['CCP-2']);assert.equal(Object.keys(r.nutrition).length,22);assert.deepEqual(r.allergens,[]);assert.ok(r.notes.length);assert.ok(r.storage.length);assert.ok(!r.plating.includes('13'));});
