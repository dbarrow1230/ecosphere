import {addOrderVendorProduct} from "../backend/services/purchasing/addOrderVendorProduct.js";
import {reserveOrderNumber} from "../backend/services/purchasing/orderNumbers.js";
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
 const groceryId=new ObjectId(),foundId=new ObjectId(),missingId=new ObjectId(),groceryIngredient=new ObjectId();
 await connection.db.collection('purchase_orders').insertOne({_id:groceryId,business_id:business,vendorRef:new ObjectId(),locationRef:new ObjectId(),status:'sent',flow:'ingredients',orderType:'grocery',orderDate:new Date('2026-04-16'),subtotal:144.70,deliveryFee:4.99,serviceFee:0,tax:.44,tip:0,total:150.13,lines:[{_id:foundId,ingredientRef:groceryIngredient,productName:'Grocery test found item',orderedQty:2,receivedQty:0,unitCost:3,packBaseQuantity:2,baseUnit:'each'},{_id:missingId,ingredientRef:null,productName:'Grocery test missing item',orderedQty:1,receivedQty:0,unitCost:5,packBaseQuantity:null}]});
 const groceryArgs={connection,ObjectId,business,orderId:groceryId,user,token:'grocery-receipt-001',deliveryDate:'2026-04-16',input:[{line:String(foundId),accepted:2,outcome:'received'},{line:String(missingId),accepted:0,notFilled:1,outcome:'notFilled'}]};
 await postIngredientReceipt(groceryArgs);await postIngredientReceipt(groceryArgs);
 const groceryOrder=await connection.db.collection('purchase_orders').findOne({_id:groceryId});assert.equal(groceryOrder.status,'received');assert.equal(groceryOrder.orderDate.toISOString().slice(0,10),'2026-04-16');assert.equal(groceryOrder.total,150.13);assert.equal(groceryOrder.receipts.length,1);assert.equal(groceryOrder.receipts[0].lines[1].notFilledQty,1);
 const stock=await inventoryWithOrderReceipts(connection.db,business);assert.equal(stock.find(item=>String(item.ingredient)===String(groceryIngredient)).quantityOnHand,4);assert.equal(stock.filter(item=>item.name==='Grocery test missing item').length,0);
 const numbers=await Promise.all(Array.from({length:12},()=>reserveOrderNumber(connection.db,business,'grocery','2026-04-16','Wegmans')));assert.equal(new Set(numbers).size,12);assert.ok(numbers.every(number=>/^GO-WEGM-20260416-\d{6}$/.test(number)));console.log('Native order-number check passed: 12 concurrent requests produced 12 distinct visible reservations.');
 const supplier=new ObjectId();await connection.db.collection('vendors').insertOne({_id:supplier,legalName:'Test grocery',isActive:true});
 const addArgs={business,vendor:supplier,line:{productName:'Imported test garlic',unitCost:4.59,purchaseUnit:'pack'},effectiveDate:'2026-04-16'};
 const added=await Promise.all([addOrderVendorProduct(connection.db,ObjectId,addArgs),addOrderVendorProduct(connection.db,ObjectId,addArgs)]);assert.equal(String(added[0]._id),String(added[1]._id));assert.equal(await connection.db.collection('vendor_ingredient_prices').countDocuments({business,vendor:supplier}),1);assert.equal(await connection.db.collection('ingredients').countDocuments({name:'Imported test garlic'}),1);assert.equal(added[0].needsDetails,true);assert.equal(added[0].imperialQuantity,null);console.log('Direct vendor add passed: saves and links one item without inventing pack measurements or duplicating retry records.');
 console.log('Native grocery check passed: backdated order, full charge breakdown, manual not-filled item, accepted stock, and idempotent retry.');
 console.log('Native receiving check passed: partial delivery, rejection, retry, atomic failure, and completion.');
}finally{
 assert.ok(databaseName.startsWith('recipe_mgmt_flow_test_'));assert.equal(connection.db.databaseName,databaseName);await connection.dropDatabase();await connection.close();console.log('Temporary test database removed.');
}
