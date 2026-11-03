import mongoose from 'mongoose';
import { blendInput, productionPlan, validId } from './blendDomain.js';
export function createInventoryService(db) {
  const ledger = db.collection('inventory_ledger');
  const oid = value => {
    if (!validId(value)) {
      const error = Error('Invalid record ID.');
      error.status = 400;
      throw error;
    }
    return new mongoose.Types.ObjectId(value);
  };
  const key = (kind, id) => `${kind === 'blend' ? 'product' : 'ingredient'}_${id}`;
  const snapshot = () => ledger.findOne({
    _id: 'main'
  });
  const allIngredients = async () => {
    const [herbs, spices] = await Promise.all(['herbs', 'spices'].map(kind => db.collection(kind).find({
      active: {
        $ne: false
      }
    }).toArray()));
    return [...herbs.map(row => ({
      ...row,
      kind: 'herbs'
    })), ...spices.map(row => ({
      ...row,
      kind: 'spices'
    }))];
  };
  const blends = async () => {
    const [rows, stock] = await Promise.all([db.collection('blends').find({
      active: {
        $ne: false
      }
    }).sort({
      name: 1
    }).toArray(), snapshot()]);
    return rows.map(row => ({
      ...row,
      stock: stock.balances[key('blend', row._id)] || 0
    }));
  };
  function operationId(value) {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{10,80}$/.test(value)) throw Error('A valid operation identifier is required.');
    return value;
  }
  async function move(id, changes, event) {
    const applied = `applied.${id}`,
      query = {
        _id: 'main',
        [applied]: {
          $exists: false
        }
      },
      inc = {};
    for (const [balance, delta] of Object.entries(changes)) {
      if (!Number.isSafeInteger(delta)) throw Error('Inventory quantity is too large or too precise.');
      inc[`balances.${balance}`] = delta;
      if (delta < 0) query[`balances.${balance}`] = {
        $gte: -delta
      };
    }
    const result = await ledger.updateOne(query, {
      $inc: inc,
      $set: {
        [applied]: true
      },
      $push: {
        events: {
          ...event,
          id,
          createdAt: new Date()
        }
      }
    });
    if (!result.modifiedCount) {
      const state = await snapshot();
      if (state.applied[id]) return false;
      const error = Error('Insufficient inventory. Refresh stock and try again.');
      error.status = 409;
      throw error;
    }
    return true;
  }
  async function checkedBlend(body) {
    const data = blendInput(body),
      ingredients = await allIngredients();
    productionPlan(data, ingredients, 1);
    data.price = Math.round(data.price * 100) / 100;
    return data;
  }
  return {
    db,
    oid,
    key,
    snapshot,
    allIngredients,
    blends,
    operationId,
    move,
    checkedBlend
  };
}
