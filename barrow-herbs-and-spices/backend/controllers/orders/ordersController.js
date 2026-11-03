export function createOrdersController({
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
    updateOrder: async (req, res) => {
      const id = oid(req.params.id),
        status = req.body.status;
      if (!['confirmed', 'completed', 'cancelled'].includes(status)) throw Error('Invalid order status.');
      // Claim one transition. An interrupted claim can be retried by the same action;
      // its ledger event makes stock changes idempotent even after a process restart.
      const current = await db.collection('orders').findOne({
        _id: id
      });
      if (!current) return res.sendStatus(404);
      if (current.status === status) return res.json(current);
      const from = current.transition?.from || current.status;
      const allowed = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled']
      };
      if (!allowed[from]?.includes(status) || current.transition && current.transition.to !== status) return res.status(409).json({
        message: 'This order status cannot make that transition.'
      });
      const claim = await db.collection('orders').updateOne({
        _id: id,
        status: current.status,
        ...(current.transition ? {
          'transition.to': status
        } : {
          transition: {
            $exists: false
          }
        })
      }, {
        $set: {
          status: 'processing',
          transition: {
            from,
            to: status
          }
        }
      });
      if (!claim.matchedCount) return res.status(409).json({
        message: 'Order changed. Refresh and retry.'
      });
      const changes = {};
      if (status === 'confirmed' || status === 'cancelled' && from === 'confirmed') for (const row of current.items) changes[key('blend', row.productId)] = (status === 'confirmed' ? -1 : 1) * row.quantity;
      try {
        await move(`order-${id}-${status}`, changes, {
          kind: 'order',
          reference: current.reference,
          status
        });
      } catch (error) {
        await db.collection('orders').updateOne({
          _id: id,
          status: 'processing',
          'transition.to': status
        }, {
          $set: {
            status: from
          },
          $unset: {
            transition: ''
          }
        });
        throw error;
      }
      await db.collection('orders').updateOne({
        _id: id,
        status: 'processing',
        'transition.to': status
      }, {
        $set: {
          status,
          updatedAt: new Date()
        },
        $unset: {
          transition: ''
        }
      });
      res.json(await db.collection('orders').findOne({
        _id: id
      }));
    }
  };
}
