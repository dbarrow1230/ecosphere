import test from 'node:test';
import assert from 'node:assert/strict';
import { blendInput, productionPlan, orderInput, publicBlend } from "./blendDomain.js";
const a = '111111111111111111111111',
  b = '222222222222222222222222';
const ingredients = [{
  _id: a,
  kind: 'spices',
  name: 'Cumin',
  costPerKg: 20
}, {
  _id: b,
  kind: 'herbs',
  name: 'Oregano',
  costPerKg: 40
}];
const recipe = {
  name: 'Test blend',
  packGrams: 100,
  packagingCost: .5,
  price: 8,
  published: true,
  formula: [{
    kind: 'spices',
    ingredientId: a,
    percent: 60
  }, {
    kind: 'herbs',
    ingredientId: b,
    percent: 40
  }]
};
test('scale formula and costing without changing the recipe', () => {
  const plan = productionPlan(blendInput(recipe), ingredients, 10);
  assert.equal(plan.grams, 1000);
  assert.deepEqual(plan.lines.map(row => row.grams), [600, 400]);
  assert.equal(plan.cost, 33);
  assert.equal(recipe.formula[0].percent, 60);
});
test('reject incomplete, duplicate, negative and nonfinite formulas', () => {
  for (const parts of [[], [{
    kind: 'spices',
    ingredientId: a,
    percent: 90
  }], [{
    kind: 'spices',
    ingredientId: a,
    percent: 50
  }, {
    kind: 'spices',
    ingredientId: a,
    percent: 50
  }], [{
    kind: 'spices',
    ingredientId: a,
    percent: -100
  }], [{
    kind: 'spices',
    ingredientId: a,
    percent: NaN
  }]]) assert.throws(() => blendInput({
    ...recipe,
    formula: parts
  }));
});
test('reject missing ingredients and fractional production packs', () => {
  assert.throws(() => productionPlan(recipe, [], 10));
  assert.throws(() => productionPlan(recipe, ingredients, 1.5));
});
test('order prices come from the saved catalog, with stock limits', () => {
  const product = {
    ...recipe,
    _id: a,
    stock: 5
  };
  const input = {
    customer: {
      name: 'Customer',
      email: 'customer@example.com'
    },
    items: [{
      productId: a,
      quantity: 2,
      unitPrice: .01
    }],
    subtotal: .02
  };
  const result = orderInput(input, [product]);
  assert.equal(result.subtotal, 16);
  assert.equal(result.items[0].unitPrice, 8);
  for (const quantity of [0, 6, 1.5, Infinity]) assert.throws(() => orderInput({
    ...input,
    items: [{
      productId: a,
      quantity
    }]
  }, [product]));
  assert.throws(() => orderInput(input, [{
    ...product,
    published: false
  }]));
});
test('public products omit formulas, costs, supplier information and internal identifiers', () => {
  const result = publicBlend({
    ...recipe,
    _id: a,
    stock: 5,
    privateNotes: 'Secret',
    vendor: 'Private'
  }, ingredients);
  assert.equal(result.ingredients, 'Cumin, Oregano');
  for (const field of ['formula', 'packagingCost', 'costPerKg', 'privateNotes', 'vendor', '_id']) assert.equal(result[field], undefined);
});
