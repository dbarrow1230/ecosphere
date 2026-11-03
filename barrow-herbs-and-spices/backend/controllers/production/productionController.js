import { text, productionPlan } from "../../services/blendDomain.js";
export function createProductionController({
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
    recordProduction: async (req, res) => {
      const blend = await db.collection('blends').findOne({
        _id: oid(req.body.blendId),
        active: {
          $ne: false
        }
      });
      if (!blend) return res.sendStatus(404);
      const plan = productionPlan(blend, await allIngredients(), req.body.units),
        changes = {
          [key('blend', blend._id)]: plan.units
        };
      for (const row of plan.lines) changes[key(row.kind, row.ingredientId)] = -Math.round(row.grams * 1000);
      const id = operationId(req.body.operationId),
        lot = text(req.body.lot || '', 80);
      if (!lot) throw Error('A lot or batch reference is required.');
      await move(id, changes, {
        kind: 'production',
        blendId: String(blend._id),
        name: blend.name,
        lot,
        ...plan,
        packGrams: blend.packGrams,
        notes: text(req.body.notes || '')
      });
      res.status(201).json({
        message: 'Batch recorded. Ingredients deducted and finished packs added.',
        reference: id
      });
    }
  };
}
