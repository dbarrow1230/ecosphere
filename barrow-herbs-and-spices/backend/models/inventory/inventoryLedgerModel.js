import mongoose from 'mongoose';
export default function createInventoryLedgerModel(connection) {
  const schema = new mongoose.Schema({
    _id: String,
    balances: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    events: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    applied: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }, {
    collection: 'inventory_ledger',
    minimize: false,
    versionKey: false
  });
  return connection.models.InventoryLedger || connection.model('InventoryLedger', schema);
}
