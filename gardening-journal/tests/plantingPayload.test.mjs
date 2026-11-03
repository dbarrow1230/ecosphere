import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePlantingPayload} from '../backend/controllers/plants/plantingController.js';
test('run updates preserve genuine zero quantities, historical death dates and untouched notes',()=>{
 const notes=[{note:'Original note',date:'2024-01-02'}];
 const existing={quantity:0,deathDate:'2024-01-01',status:'dead',notes};
 const payload=normalizePlantingPayload({status:'archived',quantity:0},existing);
 assert.equal(payload.quantity,0);
 assert.equal(payload.deathDate.toISOString().slice(0,10),'2024-01-01');
 assert.deepEqual(payload.notes,notes);
 assert.equal(normalizePlantingPayload({}).quantity,1);
});
