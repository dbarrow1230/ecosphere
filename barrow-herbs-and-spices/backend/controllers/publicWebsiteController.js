import { randomUUID } from 'node:crypto';
import { orderInput, publicBlend } from '../services/blendDomain.js';
export function createPublicWebsiteController({
  db,
  connection,
  snapshot,
  allIngredients,
  blends,
  oid,
  key,
  operationId,
  move,
  checkedBlend
}) {
  return {
    getProducts: async (req, res) => {
      const [products, ingredients] = await Promise.all([blends(), allIngredients()]);
      res.json(products.filter(row => row.published).map(row => publicBlend(row, ingredients)));
    },
    createOrder: async (req, res) => {
      const requestId = operationId(req.body.requestId),
        existing = await db.collection('orders').findOne({
          requestId
        });
      if (existing) return res.json({
        reference: existing.reference,
        message: 'Your order request has already been received. No payment has been taken.'
      });
      const data = orderInput(req.body, await blends());
      const row = {
        ...data,
        requestId,
        reference: `HS-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      try {
        await db.collection('orders').insertOne(row);
      } catch (error) {
        if (error.code !== 11000) throw error;
        const saved = await db.collection('orders').findOne({
          requestId
        });
        return res.json({
          reference: saved.reference,
          message: 'Your order request has already been received. No payment has been taken.'
        });
      }
      res.status(201).json({
        reference: row.reference,
        message: 'Order request received. We will confirm availability, fulfillment, and payment. No payment has been taken.'
      });
    }
  };
}
