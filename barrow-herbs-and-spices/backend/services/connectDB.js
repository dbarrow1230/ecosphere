import mongoose from 'mongoose';
import { createModels } from "./modelRegistry.js";
import { createRecordRepository } from './recordRepository.js';
export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });
  const connection = mongoose.connection;
  const models = createModels(connection);
  await Promise.all(Object.values(models).map(model => model.init()));
  const db = createRecordRepository(models);
  await db.collection('inventory_ledger').updateOne({
    _id: 'main'
  }, {
    $setOnInsert: {
      balances: {},
      events: [],
      applied: {}
    }
  }, {
    upsert: true
  });
  return {
    connection,
    db
  };
}
