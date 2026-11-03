import { resources, text, number } from "../../services/blendDomain.js";
function resourceInput(body, kind) {
  const name = text(body.name, 120);
  if (!name) throw Error('A name is required.');
  const row = {
    name,
    notes: text(body.notes || ''),
    category: text(body.category || '', 100),
    type: text(body.type || '', 100)
  };
  if(kind==='equipment'){
    row.equipment_id=text(body.equipment_id||'',120);
    if(!row.equipment_id)throw Error('Enter the equipment_id used to identify this equipment.');
  }
  if(kind==='equipment_vendors')row.vendor_name=text(body.vendor_name||name,120);
  if (['herbs', 'spices'].includes(kind)) Object.assign(row, {
    botanicalName: text(body.botanicalName || '', 150),
    costPerKg: number(body.costPerKg),
    vendor: text(body.vendor || '', 120),
    allergens: text(body.allergens || '', 500)
  });else Object.assign(row, {
    email: text(body.email || '', 254),
    phone: text(body.phone || '', 50)
  });
  if(kind==='vendors'&&!row.email)throw Error('Enter a vendor email; the existing database has a unique email index.');
  return row;
}
export function createResourcesController({
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
    getResources: async (req, res) => {
      if (!resources.includes(req.params.kind)) return res.sendStatus(404);
      res.json(await db.collection(req.params.kind).find({
        active: {
          $ne: false
        }
      }).sort({
        name: 1
      }).toArray());
    },
    createResource: async (req, res) => {
      const {
        kind
      } = req.params;
      if (!resources.includes(kind)) return res.sendStatus(404);
      const row = {
        ...resourceInput(req.body, kind),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection(kind).insertOne(row);
      res.status(201).json({
        ...row,
        _id: result.insertedId
      });
    },
    updateResource: async (req, res) => {
      const {
        kind
      } = req.params;
      if (!resources.includes(kind)) return res.sendStatus(404);
      const row = await db.collection(kind).findOneAndUpdate({
        _id: oid(req.params.id),
        active: {
          $ne: false
        }
      }, {
        $set: {
          ...resourceInput(req.body, kind),
          updatedAt: new Date()
        }
      }, {
        returnDocument: 'after'
      });
      if (!row) return res.sendStatus(404);
      res.json(row);
    },
    archiveResource: async (req, res) => {
      const {
        kind,
        id
      } = req.params;
      if (!resources.includes(kind)) return res.sendStatus(404);
      oid(id);
      if (['herbs', 'spices'].includes(kind) && (await db.collection('blends').findOne({
        active: {
          $ne: false
        },
        'formula.ingredientId': id
      }))) return res.status(409).json({
        message: 'Remove this ingredient from active blend recipes before archiving it.'
      });
      const result = await db.collection(kind).updateOne({
        _id: oid(id)
      }, {
        $set: {
          active: false,
          updatedAt: new Date()
        }
      });
      if (!result.matchedCount) return res.sendStatus(404);
      res.json({
        message: 'Record archived.'
      });
    }
  };
}
