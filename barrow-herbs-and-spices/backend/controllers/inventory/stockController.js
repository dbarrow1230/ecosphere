import { text, number } from "../../services/blendDomain.js";
export function createStockController({
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
    adjustStock: async (req, res) => {
      const {
        kind,
        id
      } = req.body;
      if (!['herbs', 'spices'].includes(kind)) throw Error('Select an ingredient.');
      const row = await db.collection(kind).findOne({
        _id: oid(id),
        active: {
          $ne: false
        }
      });
      if (!row) return res.sendStatus(404);
      if (!['add', 'remove'].includes(req.body.direction)) throw Error('Choose add or remove for the stock adjustment.');
      const grams = number(req.body.grams, 0.001, 1e7),
        direction = req.body.direction === 'remove' ? -1 : 1;
      const note = text(req.body.note || '', 300);
      if (!note) throw Error('Enter a stock adjustment reason.');
      await move(operationId(req.body.operationId), {
        [key(kind, id)]: direction * Math.round(grams * 1000)
      }, {
        kind: 'adjustment',
        name: row.name,
        grams: direction * grams,
        note
      });
      res.json({
        message: 'Ingredient stock updated.'
      });
    }
  };
}
