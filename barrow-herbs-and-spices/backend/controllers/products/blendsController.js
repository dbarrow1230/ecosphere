export function createBlendsController({
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
    createBlend: async (req, res) => {
      const row = {
        ...(await checkedBlend(req.body)),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('blends').insertOne(row);
      res.status(201).json({
        ...row,
        _id: result.insertedId
      });
    },
    updateBlend: async (req, res) => {
      const row = await db.collection('blends').findOneAndUpdate({
        _id: oid(req.params.id),
        active: {
          $ne: false
        }
      }, {
        $set: {
          ...(await checkedBlend(req.body)),
          updatedAt: new Date()
        }
      }, {
        returnDocument: 'after'
      });
      if (!row) return res.sendStatus(404);
      res.json(row);
    },
    archiveBlend: async (req, res) => {
      const result = await db.collection('blends').updateOne({
        _id: oid(req.params.id)
      }, {
        $set: {
          active: false,
          published: false,
          updatedAt: new Date()
        }
      });
      if (!result.matchedCount) return res.sendStatus(404);
      res.json({
        message: 'Blend archived. Production and order history retained.'
      });
    }
  };
}
