import test from 'node:test';
import assert from 'node:assert/strict';
import HydroSystem from '../backend/models/hydroponics/hydroSystemModel.js';
import {cleanHydroSystemPayload} from '../backend/controllers/hydroponics/hydroSystemController.js';
const deviceId='697000000000000000000001',seedId='697000000000000000000002';
const saved={name:'Saved run',startedDate:'2024-02-08',notes:'Original run notes',isActive:false,devices:[{_id:deviceId,name:'My device',podCount:2,waterLevel:0,phLevel:6,notes:'Device notes',pods:[{position:1,seed:seedId,plantedDate:'2024-02-09',notes:'Original pod note'},{position:2,seed:null}]}]};
test('metadata edits retain the actual HydroSystem devices, pods, readings and dates',async()=>{
 const payload=cleanHydroSystemPayload({name:'Renamed run'},saved.devices,null,saved);
 assert.equal(payload.devices.length,1);
 assert.equal(String(payload.devices[0]._id),deviceId);
 assert.equal(String(payload.devices[0].pods[0].seed),seedId);
 assert.equal(payload.devices[0].waterLevel,0);
 assert.equal(payload.notes,saved.notes);
 assert.equal(payload.isActive,false);
 assert.equal(payload.startedDate.toISOString().slice(0,10),'2024-02-08');
 await new HydroSystem(payload).validate();
});
test('a pod-note edit does not erase the seed, its planted date, other pods or device metadata',()=>{
 const payload=cleanHydroSystemPayload({devices:[{_id:deviceId,pods:[{position:1,notes:'Updated note'}]}]},saved.devices,null,saved);
 const device=payload.devices[0];
 assert.equal(device.name,'My device');
 assert.equal(device.podCount,2);
 assert.equal(device.pods.length,2);
 assert.equal(String(device.pods[0].seed),seedId);
 assert.equal(device.pods[0].notes,'Updated note');
 assert.equal(device.pods[0].plantedDate.toISOString().slice(0,10),'2024-02-09');
});
test('explicit removal and empty assignments are not replaced by fabricated devices or seeds',()=>{
 assert.equal(cleanHydroSystemPayload({devices:[]},saved.devices,null,saved).devices.length,0);
 const payload=cleanHydroSystemPayload({devices:[{_id:deviceId,pods:[{position:1,seed:null}]}]},saved.devices,null,saved);
 assert.equal(payload.devices[0].pods[0].seed,null);
 assert.equal(saved.devices[0].pods[0].seed,seedId);
});
