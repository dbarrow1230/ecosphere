export function createOverviewController({
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
    getOverview: async (req, res) => {
      const [products, ingredients, state, orders] = await Promise.all([blends(), allIngredients(), snapshot(), db.collection('orders').find({}).sort({
        createdAt: -1
      }).limit(200).toArray()]);
      res.json({
        blends: products,
        ingredients: ingredients.map(row => ({
          ...row,
          stockGrams: (state.balances[key(row.kind, row._id)] || 0) / 1000
        })),
        batches: state.events.filter(row => row.kind === 'production').reverse(),
        orders
      });
    }
  };
}
