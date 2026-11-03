import test from 'node:test';
import assert from 'node:assert/strict';
import SeedCollection from '../backend/models/seeds/seedCollectionModel.js';
import {cleanCollectionData} from '../backend/controllers/seeds/seedCollectionController.js';
test('collection fields round-trip independently from seed catalogue inventory',async()=>{
 const original={seed:'697000000000000000000001',seedCount:0,inventoryYear:2024,germinationRate:0,buyMore:false,dateCollected:'2024-04-03',amountUnit:'seeds',sourceType:'harvested',sourceName:'My saved tomatoes',notes:['Actual collection note'],status:'stored',labelColor:'#123456'};
 const payload=cleanCollectionData({...original,notes:['Updated collection note']});
 assert.equal(payload.seedCount,0);
 assert.equal(payload.germinationRate,0);
 assert.equal(payload.inventoryYear,2024);
 assert.equal(payload.sourceName,original.sourceName);
 assert.equal(payload.status,'stored');
 assert.deepEqual(payload.notes,['Updated collection note']);
 await new SeedCollection({...payload,user:'697000000000000000000002'}).validate();
 assert.equal('seed_count' in payload,false);
});
