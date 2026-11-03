// Explicitly invoked live smoke check. Creates and removes only its own tagged fixtures.
import dotenvx from '@dotenvx/dotenvx';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
dotenvx.config({
  path: [path.join(root, 'config/.env.mongo'), path.join(root, 'backend/.env')],
  quiet: true
});
const conn = await mongoose.createConnection(process.env.ECOSPHERE_MONGO_URI||process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  }).asPromise(),
  db = conn.useDb('herbs_spices').db;
const user = await conn.db.collection('users').findOne({
  _id: new mongoose.Types.ObjectId('69af088d21b4580a8cb6614b'),
  isActive: {
    $ne: false
  }
});
assert.ok(user, 'Existing owner is required for the authorized smoke check.');
const token = jwt.sign({
    id: String(user._id)
  }, process.env.JWT_SECRET, {
    expiresIn: '5m'
  }),
  base = 'http://127.0.0.1:6022',
  tag = `SMOKE-${randomUUID()}`;
const records = [],
  events = [],
  balanceKeys = [];
async function request(url, body, method = 'POST', auth = true, expected = 200) {
  const response = await fetch(base + url, {
    method: body ? method : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? {
        Authorization: `Bearer ${token}`
      } : {})
    },
    ...(body ? {
      body: JSON.stringify(body)
    } : {})
  });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return result;
}
const operation = () => {
  const id = randomUUID();
  events.push(id);
  return id;
};
let fixture;
try {
  assert.equal((await fetch(base + '/api/studio/overview')).status, 401);
  const ingredient = await request('/api/studio/resources/spices', {
    name: tag,
    costPerKg: 20
  }, 'POST', true, 201);
  records.push(['spices', ingredient._id]);
  balanceKeys.push(`ingredient_${ingredient._id}`);
  await request('/api/studio/stock', {
    kind: 'spices',
    id: ingredient._id,
    grams: 1000,
    direction: 'add',
    note: tag,
    operationId: operation()
  });
  const blend = await request('/api/studio/blends', {
    name: tag,
    sku: tag,
    packGrams: 100,
    packagingCost: .5,
    price: 8,
    published: true,
    allergens: 'Test fixture',
    formula: [{
      kind: 'spices',
      ingredientId: ingredient._id,
      percent: 100
    }]
  }, 'POST', true, 201);
  records.push(['blends', blend._id]);
  balanceKeys.push(`product_${blend._id}`);
  fixture = blend;
  const batch = {
    blendId: blend._id,
    units: 5,
    lot: tag,
    operationId: operation()
  };
  await Promise.all([request('/api/studio/production', batch, 'POST', true, 201), request('/api/studio/production', batch, 'POST', true, 201)]);
  let state = await request('/api/studio/overview');
  assert.equal(state.blends.find(row => row._id === blend._id).stock, 5);
  assert.equal(state.ingredients.find(row => row._id === ingredient._id).stockGrams, 500);
  await request('/api/studio/production', {
    ...batch,
    units: 100,
    operationId: operation()
  }, 'POST', true, 409);
  state = await request('/api/studio/overview');
  assert.equal(state.ingredients.find(row => row._id === ingredient._id).stockGrams, 500);
  const catalog = await request('/api/public-site/products'),
    product = catalog.find(row => row.id === blend._id);
  assert.ok(product);
  assert.equal(product.formula, undefined);
  assert.equal(product.packagingCost, undefined);
  const orderId = randomUUID(),
    payload = {
      requestId: orderId,
      customer: {
        name: tag,
        email: 'smoke@example.invalid'
      },
      items: [{
        productId: blend._id,
        quantity: 2,
        unitPrice: .01
      }]
    };
  const order = await request('/api/public-site/orders', payload, 'POST', false, 201);
  const repeated = await request('/api/public-site/orders', payload, 'POST', false);
  assert.equal(order.reference, repeated.reference);
  state = await request('/api/studio/overview');
  const stored = state.orders.find(row => row.reference === order.reference);
  records.push(['orders', stored._id]);
  assert.equal(stored.subtotal, 16);
  assert.equal(state.blends.find(row => row._id === blend._id).stock, 5);
  events.push(`order-${stored._id}-confirmed`, `order-${stored._id}-cancelled`);
  await request(`/api/studio/orders/${stored._id}`, {
    status: 'confirmed'
  }, 'PATCH');
  await request(`/api/studio/orders/${stored._id}`, {
    status: 'confirmed'
  }, 'PATCH');
  state = await request('/api/studio/overview');
  assert.equal(state.blends.find(row => row._id === blend._id).stock, 3);
  await request(`/api/studio/orders/${stored._id}`, {
    status: 'cancelled'
  }, 'PATCH');
  await request(`/api/studio/orders/${stored._id}`, {
    status: 'cancelled'
  }, 'PATCH');
  state = await request('/api/studio/overview');
  assert.equal(state.blends.find(row => row._id === blend._id).stock, 5);
  await request(`/api/studio/orders/${stored._id}`, {
    status: 'confirmed'
  }, 'PATCH', true, 409);
  console.log('PASS: authenticated management, stock receipt, costing, concurrent batch retries, insufficient-stock rollback, public filtering, server pricing, duplicate requests, order confirmation/cancellation and repeat safety.');
  if (process.env.KEEP_SMOKE_FIXTURE === '1') console.log('Temporary visual fixture retained:', tag, fixture._id);
} finally {
  if (process.env.KEEP_SMOKE_FIXTURE !== '1') {
    for (const [collection, id] of records) await db.collection(collection).deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      ...(collection === 'orders' ? {
        'customer.name': tag
      } : {
        name: tag
      })
    });
    const unset = {};
    for (const id of events) unset[`applied.${id}`] = '';
    for (const key of balanceKeys) unset[`balances.${key}`] = '';
    await db.collection('inventory_ledger').updateOne({
      _id: 'main'
    }, {
      $unset: unset,
      $pull: {
        events: {
          id: {
            $in: events
          }
        }
      }
    });
    console.log('Temporary test records and their ledger entries removed.');
  }
  await conn.close();
}
