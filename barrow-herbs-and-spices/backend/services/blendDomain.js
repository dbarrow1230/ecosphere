export const resources = ['herbs', 'spices', 'vendors', 'equipment', 'kitchen_equipment', 'equipment_vendors', 'category', 'types'];
export const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function text(value, max = 2000) {
  if (typeof value !== 'string' || value.length > max) throw Error(`Text must be at most ${max} characters.`);
  return value.trim();
}
export function number(value, min = 0, max = 1e9) {
  if (value === '' || value === null || typeof value === 'boolean') throw Error('Enter a valid number.');
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw Error(`Enter a number between ${min} and ${max}.`);
  return n;
}
export function validId(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}
export function formula(value) {
  if (!Array.isArray(value) || !value.length || value.length > 100) throw Error('Add at least one ingredient.');
  const seen = new Set();
  const rows = value.map(row => {
    if (!['herbs', 'spices'].includes(row.kind) || !validId(row.ingredientId) || seen.has(row.ingredientId)) throw Error('Choose distinct herbs or spices.');
    seen.add(row.ingredientId);
    return {
      kind: row.kind,
      ingredientId: row.ingredientId,
      percent: number(row.percent, 0.001, 100)
    };
  });
  if (Math.abs(rows.reduce((n, row) => n + row.percent, 0) - 100) > 0.00001) throw Error('Ingredient percentages must total 100%.');
  return rows;
}
export function blendInput(body) {
  const name = text(body.name, 120);
  if (!name) throw Error('A blend name is required.');
  const image = text(body.image || '', 1000);
  if (image && !/^https:\/\//i.test(image)) throw Error('Product images must use an HTTPS URL.');
  return {
    name,
    description: text(body.description || ''),
    sku: text(body.sku || '', 80),
    category: text(body.category || '', 100),
    heat: text(body.heat || 'Mild', 60),
    uses: text(body.uses || ''),
    storage: text(body.storage || ''),
    allergens: text(body.allergens || '', 500),
    image,
    packGrams: number(body.packGrams, 1, 100000),
    packagingCost: number(body.packagingCost),
    price: number(body.price),
    published: body.published === true,
    formula: formula(body.formula)
  };
}
export function productionPlan(blend, ingredients, units) {
  const count = number(units, 1, 100000);
  if (!Number.isInteger(count)) throw Error('Production units must be whole numbers.');
  const grams = blend.packGrams * count;
  const lines = blend.formula.map(row => {
    const ingredient = ingredients.find(item => String(item._id) === row.ingredientId && item.kind === row.kind && item.active !== false);
    if (!ingredient) throw Error('A recipe ingredient is unavailable.');
    const quantity = grams * row.percent / 100;
    return {
      ...row,
      name: ingredient.name,
      grams: quantity,
      cost: quantity * Number(ingredient.costPerKg || 0) / 1000
    };
  });
  return {
    units: count,
    grams,
    lines,
    cost: round(lines.reduce((sum, row) => sum + row.cost, 0) + count * blend.packagingCost)
  };
}
export function orderInput(body, products) {
  const customer = body.customer || {},
    name = text(customer.name, 120),
    email = text(customer.email, 254).toLowerCase();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) throw Error('Enter a name and valid email address.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw Error('Choose between 1 and 50 blends.');
  const seen = new Set();
  const items = body.items.map(row => {
    const product = products.find(p => String(p._id) === row.productId && p.published && p.active !== false),
      quantity = number(row.quantity, 1, 99);
    if (!product || !Number.isInteger(quantity) || seen.has(row.productId)) throw Error('A product or quantity is unavailable.');
    if (quantity > product.stock) throw Error(`${product.name} does not have enough finished stock.`);
    seen.add(row.productId);
    return {
      productId: row.productId,
      name: product.name,
      quantity,
      unitPrice: product.price,
      packGrams: product.packGrams
    };
  });
  return {
    customer: {
      name,
      email,
      phone: text(customer.phone || '', 50)
    },
    notes: text(body.notes || ''),
    items,
    subtotal: round(items.reduce((sum, row) => sum + row.unitPrice * row.quantity, 0))
  };
}
// Only these fields may leave the management API. Formulas, costs and supplier notes stay private.
export function publicBlend(row, ingredients) {
  return {
    id: String(row._id),
    name: row.name,
    description: row.description,
    category: row.category,
    heat: row.heat,
    uses: row.uses,
    storage: row.storage,
    allergens: row.allergens,
    image: row.image,
    price: row.price,
    packGrams: row.packGrams,
    stock: row.stock,
    ingredients: row.formula.map(part => ingredients.find(item => String(item._id) === part.ingredientId)?.name || 'Ingredient').join(', ')
  };
}
