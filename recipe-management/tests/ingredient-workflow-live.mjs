import {inventoryWithOrderReceipts} from "../../shared/culinary/receivingLedger.js";
import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import mongoose from 'mongoose';import {postIngredientReceipt} from '../backend/services/purchasing/ingredientWorkflow.js';
const databaseName=`recipe_mgmt_flow_test_${randomUUID().replaceAll('-','')}`;
const connection=await mongoose.createConnection(process.env.MONGO_URI,{dbName:databaseName}).asPromise();
try{
 assert.equal(connection.db.databaseName,databaseName);
 for(const name of ['purchase_orders','purchase_order_lines','goods_receipts','goods_receipt_lines','inventory','inventory_transactions'])await connection.db.createCollection(name);
 const ObjectId=mongoose.Types.ObjectId,business=new ObjectId(),orderId=new ObjectId(),lineId=new ObjectId(),user=new ObjectId();
 await connection.db.collection('purchase_orders').insertOne({_id:orderId,business_id:business,vendorRef:new ObjectId(),locationRef:new ObjectId(),status:'sent',flow:'ingredients'});
 await connection.db.collection('purchase_order_lines').insertOne({_id:lineId,business_id:business,purchaseOrderRef:orderId,ingredientRef:new ObjectId(),vendorIngredientPriceRef:new ObjectId(),productName:'Workflow test',packBaseQuantity:500,baseUnit:'g',unitCost:4,orderedQty:3,receivedQty:0});
 const args={connection,ObjectId,business,orderId,user,token:'native-receipt-001',input:[{line:String(lineId),accepted:2,rejected:1,lotNumber:'TEST'}]};
 await postIngredientReceipt(args);await postIngredientReceipt(args);
 assert.equal((await inventoryWithOrderReceipts(connection.db,business))[0].quantityOnHand,1000);assert.equal((await connection.db.collection('purchase_orders').findOne({_id:orderId})).receipts.length,1);
 await connection.db.command({collMod:'purchase_orders',validator:{$jsonSchema:{required:['forceFailure']}}});
 await assert.rejects(postIngredientReceipt({...args,token:'native-receipt-002',input:[{line:String(lineId),accepted:1,rejected:0}]}));
 assert.equal((await inventoryWithOrderReceipts(connection.db,business))[0].quantityOnHand,1000);assert.equal((await connection.db.collection('purchase_orders').findOne({_id:orderId})).receipts.length,1);
 await connection.db.command({collMod:'purchase_orders',validator:{}});
 await postIngredientReceipt({...args,token:'native-receipt-002',input:[{line:String(lineId),accepted:1,rejected:0}]});
 assert.equal((await inventoryWithOrderReceipts(connection.db,business))[0].quantityOnHand,1500);assert.equal((await connection.db.collection('purchase_orders').findOne({_id:orderId})).status,'received');assert.equal((await connection.db.collection('purchase_orders').findOne({_id:orderId})).receipts.length,2);
 console.log('Native receiving check passed: partial delivery, rejection, retry, atomic failure, and completion.');
}finally{
 assert.ok(databaseName.startsWith('recipe_mgmt_flow_test_'));assert.equal(connection.db.databaseName,databaseName);await connection.dropDatabase();await connection.close();console.log('Temporary test database removed.');
}
