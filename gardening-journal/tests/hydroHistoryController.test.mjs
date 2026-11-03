import test from 'node:test';
import assert from 'node:assert/strict';
import HydroSystem from '../backend/models/hydroponics/hydroSystemModel.js';
import Seed from '../backend/models/seeds/seedModel.js';
import {retryHydroPod,changeHydroPodRecord,deleteHydroSystem} from '../backend/controllers/hydroponics/hydroSystemController.js';
const originalId='697000000000000000000001',targetId='697000000000000000000002',deviceId='697000000000000000000003',podId='697000000000000000000004',seedId='697000000000000000000005';
const copy=value=>JSON.parse(JSON.stringify(value));
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}});

test('standalone MongoDB retries save one document, retain original history, require a unique index, and reject duplicate retries',async()=>{
 const original={_id:originalId,name:'Original',isActive:false,__v:0,devices:[{_id:deviceId,name:'Device',podCount:2,pods:[{_id:podId,position:1,seed:seedId,seedCount:3,plantedDate:'2024-01-01',germinationStatus:'failed',failedAt:'2024-01-20',removedAt:'2024-01-20',notes:'Original failure note'}]}]};
 const target={_id:targetId,name:'New run',__v:0,devices:[{_id:deviceId,name:'Device',podCount:2,pods:[]}]};
 let store=new Map([[originalId,copy(original)],[targetId,copy(target)]]),failTarget=false;
 const oldFind=HydroSystem.findById,oldSeed=Seed.findById,oldSave=HydroSystem.prototype.save,oldTransaction=HydroSystem.base.connection.transaction,oldIndex=HydroSystem.collection.createIndex;
 let indexReady=false;
 const query=record=>({session(){return this;},populate(){return this;},then(resolve,reject){return Promise.resolve(record).then(resolve,reject);}});
 HydroSystem.findById=id=>query(store.has(String(id))?HydroSystem.hydrate(copy(store.get(String(id)))):null);
 Seed.findById=()=>query({_id:seedId,growthInformation:{germinationTime:{max:10}}});
 HydroSystem.prototype.save=async function(){await this.validate();if(failTarget&&String(this._id)===targetId)throw new Error('Simulated target save failure');if(this.devices.some(device=>device.pods.some(pod=>pod.retryOf)))assert.equal(indexReady,true);if([...store].some(([id,record])=>id!==String(this._id)&&(record.retryClaims||[]).some(claim=>this.retryClaims.some(value=>String(value)===claim))))throw Object.assign(new Error('Duplicate retry source'),{code:11000});this.__v=(this.__v||0)+1;store.set(String(this._id),copy(this.toObject()));return this;};
 HydroSystem.base.connection.transaction=async()=>{throw new Error('Transactions must not be required');};
 HydroSystem.collection.createIndex=async(keys,options)=>{assert.deepEqual(keys,{retryClaims:1});assert.equal(options.unique,true);assert.deepEqual(options.partialFilterExpression,{'retryClaims.0':{$exists:true}});indexReady=true;return options.name;};
 try{
  const req={params:{id:targetId},body:{originalRun:originalId,originalPod:podId,deviceId,position:2,seedCount:1,plantedDate:'2026-01-01',version:0}};
  failTarget=true;const failed=response();await retryHydroPod(req,failed);assert.equal(failed.statusCode,500);assert.equal(store.get(originalId).devices[0].pods[0].retryTo,undefined);assert.equal(store.get(targetId).devices[0].pods.length,0);
  failTarget=false;const success=response();await retryHydroPod(req,success);assert.equal(success.statusCode,201);
  const source=store.get(originalId).devices[0].pods[0],retry=store.get(targetId).devices[0].pods[0];
  assert.equal(source.retryTargetRun,undefined);assert.equal(source.retryTo,undefined);assert.equal(source.seedCount,3);assert.equal(source.notes,'Original failure note');assert.equal(retry.retryRun,originalId);assert.equal(retry.retryOf,podId);assert.equal(retry.seedCount,1);assert.deepEqual(store.get(targetId).retryClaims,[podId]);assert.deepEqual(store.get(originalId),original);
  const duplicate=response();await retryHydroPod({...req,body:{...req.body,version:1}},duplicate);assert.equal(duplicate.statusCode,409);assert.equal(store.get(targetId).devices[0].pods.length,1);
  const competingId='697000000000000000000009';store.set(competingId,{...copy(target),_id:competingId});const competing=response();await retryHydroPod({...req,params:{id:competingId}},competing);assert.equal(competing.statusCode,409);assert.equal(store.get(competingId).devices[0].pods.length,0);assert.deepEqual(store.get(originalId),original);
  const stale=response();await changeHydroPodRecord({params:{id:targetId,podId:retry._id,action:'move'},body:{version:0,deviceId,position:1}},stale);assert.equal(stale.statusCode,409);assert.equal(store.get(targetId).devices[0].pods[0].position,2);
  const completed=response();await deleteHydroSystem({params:{id:targetId}},completed);assert.equal(completed.statusCode,200);assert.equal(store.get(targetId).isActive,false);assert.equal(store.get(targetId).devices[0].pods.length,1);assert.ok(store.get(targetId).completedAt);
 }finally{HydroSystem.findById=oldFind;Seed.findById=oldSeed;HydroSystem.prototype.save=oldSave;HydroSystem.base.connection.transaction=oldTransaction;HydroSystem.collection.createIndex=oldIndex;}
});
