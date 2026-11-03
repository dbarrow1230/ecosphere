import test from 'node:test';
import assert from 'node:assert/strict';
import HydroSystem from '../backend/models/hydroponics/hydroSystemModel.js';
import {plantHydroPod,changeHydroPod,linkHydroRetry,retainHydroHistory} from '../backend/services/hydroHistory.js';
import {germinationState,germinationDeadline,hydroPodActive} from '../src/utils/hydroHistory.js';
import {buildHydroReports} from '../backend/services/hydroReports.js';
const runId='697000000000000000000001',deviceId='697000000000000000000002',seedId='697000000000000000000003';
const seed={_id:seedId,plantName:'Lettuce',growthInformation:{germinationTime:{max:10}}};
const now=new Date('2026-11-03T12:00:00Z');
const run=()=>({_id:runId,name:'Original',isActive:true,startedDate:'2026-10-01',devices:[{_id:deviceId,name:'Device',podCount:3,pods:[]}]});
const plant=(record,position=1)=>plantHydroPod(record,{deviceId,position,seedCount:3,plantedDate:'2026-10-01'},seed,now);

test('planting quantities belong to attempts, reject invalid quantities, and snapshot the known germination maximum',()=>{
 const record=run();for(const seedCount of [0,-1,1.2,''])assert.throws(()=>plantHydroPod(record,{deviceId,position:1,seedCount,plantedDate:'2026-10-01'},seed,now),/positive integer/);
 const pod=plant(record);assert.equal(pod.seedCount,3);assert.equal(pod.maxGerminationDays,10);assert.equal(pod.germinationStatus,'awaiting');
 assert.equal(germinationDeadline(pod).toISOString(),'2026-10-11T00:00:00.000Z');
 assert.equal(germinationState(pod,'2026-10-10T23:59:59Z'),'Awaiting Germination');assert.equal(germinationState(pod,'2026-10-11T00:00:00Z'),'Germination Overdue');
 assert.equal(pod.failedAt,undefined);assert.equal(germinationState({seed:seedId,plantedDate:'2026-10-01'}),'Unknown or Unrecorded');
});

test('dragging moves the planting identity, quantities and notes, and records both positions; occupied destinations leave state unchanged',()=>{
 const record=run(),pod=plant(record);pod.notes='Original note';const second=plant(record,2),before=JSON.stringify(record);
 assert.throws(()=>changeHydroPod(record,String(pod._id),'move',{deviceId,position:2},now),/occupied/);assert.equal(JSON.stringify(record),before);
 changeHydroPod(record,String(pod._id),'move',{deviceId,position:3},now);
 assert.equal(pod.position,3);assert.equal(pod.seedCount,3);assert.equal(pod.notes,'Original note');assert.equal(pod.positionHistory[0].from,1);assert.equal(pod.positionHistory[0].to,3);assert.equal(second.position,2);
 assert.throws(()=>changeHydroPod(record,String(pod._id),'move',{deviceId,position:4},now),/outside/);
});

test('failure is user-confirmed, timestamped once, retains the planting, and makes its position reusable',()=>{
 const record=run(),pod=plant(record);
 assert.throws(()=>changeHydroPod(record,String(pod._id),'fail',{},new Date('2026-10-02')),/overdue/);
 changeHydroPod(record,String(pod._id),'fail',{},now);const failedAt=pod.failedAt;
 changeHydroPod(record,String(pod._id),'fail',{},new Date('2026-11-04'));
 assert.equal(pod.failedAt,failedAt);assert.equal(pod.removedAt,failedAt);assert.equal(pod.seedCount,3);assert.equal(hydroPodActive(pod),false);
 const next=plant(record);assert.notEqual(String(next._id),String(pod._id));assert.equal(record.devices[0].pods.length,2);
 assert.throws(()=>changeHydroPod(record,String(pod._id),'germinate',{},now),/no longer active/);
});

test('overdue germination can be recorded as success without becoming a failure; completed runs reject changes',()=>{
 const record=run(),pod=plant(record);changeHydroPod(record,String(pod._id),'germinate',{},now);
 assert.equal(germinationState(pod,now),'Germinated');assert.throws(()=>changeHydroPod(record,String(pod._id),'fail',{},now),/without recorded germination/);
 record.isActive=false;assert.throws(()=>changeHydroPod(record,String(pod._id),'move',{deviceId,position:2},now),/read-only/);
});

test('retry keeps original failure, seed quantity and notes, uses a different run and independent seed quantity, and supports chains',()=>{
 const original=run(),failed=plant(original);failed.notes='Original';changeHydroPod(original,String(failed._id),'fail',{},now);
 const target={...run(),_id:'697000000000000000000004',name:'Retry'};
 const retry=linkHydroRetry(original,target,{originalPod:String(failed._id),deviceId,position:1,seedCount:2,plantedDate:'2026-11-03'},seed,now);
 assert.equal(String(retry.retryOf),String(failed._id));assert.equal(String(retry.retryRun),runId);assert.equal(retry.seedCount,2);assert.equal(failed.seedCount,3);assert.equal(failed.notes,'Original');assert.equal(failed.germinationStatus,'failed');
 assert.throws(()=>linkHydroRetry(original,target,{originalPod:String(failed._id)},seed,now),/already been retried/);
 const linked=buildHydroReports([original,target],[],{},now);
 assert.equal(linked.retries.length,0);assert.equal(linked.plantings[0].retryTo,String(retry._id));assert.equal(linked.plantings[0].retryTargetRun,String(target._id));
 changeHydroPod(target,String(retry._id),'fail',{},new Date('2026-11-20'));
 const third={...run(),_id:'697000000000000000000005'};
 const final=linkHydroRetry(target,third,{originalPod:String(retry._id),deviceId,position:2,seedCount:1,plantedDate:'2026-11-20'},seed,new Date('2026-11-20'));
 assert.equal(String(final.retryOf),String(retry._id));
});

test('metadata changes preserve removed plantings, removed devices and dated environmental readings',()=>{
 const record=run(),pod=plant(record);changeHydroPod(record,String(pod._id),'fail',{},now);
 const saved=record.devices[0];Object.assign(saved,{lastReadingAt:new Date('2026-10-01'),phLevel:6,waterLevel:0});
 const retained=retainHydroHistory(record,[{...saved,pods:[],lastReadingAt:new Date('2026-11-03'),phLevel:7}]);
 assert.equal(retained[0].pods.length,1);assert.equal(retained[0].readings.length,2);assert.equal(retained[0].readings[0].phLevel,6);assert.equal(retained[0].readings[0].waterLevel,0);
 assert.equal(retainHydroHistory(record,[])[0].isActive,false);
});

test('reports keep runs and attempts separate, use confirmed outcomes, retain notes and retry data, and never turn missing quantities into zero',()=>{
 const first=run(),failed=plant(first);changeHydroPod(first,String(failed._id),'fail',{},now);
 const second={...run(),_id:'697000000000000000000004',name:'Second'};const pending=plant(second);pending.seedCount=null;
 const journal=[{_id:'note-a',hydroSystem:first._id,hydroPod:failed._id,entryType:'observation',entry:'First run only',notes:[{date:now,readings:{ph:6,humidity:50}}]}];
 const report=buildHydroReports([first,second],journal,{},now);
 assert.equal(report.runs[0].failed,1);assert.equal(report.runs[1].failed,0);assert.equal(report.runs[1].unresolved,1);assert.equal(report.plantings[1].seedCount,null);
 assert.equal(report.retries.length,1);assert.equal(report.notes[0].run,runId);assert.equal(report.environment[0].phLevel,6);
 assert.equal(buildHydroReports([first,second],journal,{runs:String(second._id)},now).notes.length,0);
 assert.equal(buildHydroReports([first,second],journal,{phMin:'5.5',phMax:'6.5'},now).runs.length,1);
});

test('legacy hydration produces stable pod identities without assigning outcomes, quantities, or writing migrations',()=>{
 const source={_id:runId,name:'Legacy',devices:[{_id:deviceId,name:'Device',podCount:2,pods:[{position:1,seed:seedId,plantedDate:'2024-01-01'}]}]};
 const first=HydroSystem.hydrate(structuredClone(source)),second=HydroSystem.hydrate(structuredClone(source));
 assert.equal(String(first.devices[0].pods[0]._id),String(second.devices[0].pods[0]._id));assert.equal(first.devices[0].pods[0].germinationStatus,undefined);assert.equal(first.devices[0].pods[0].seedCount,null);
});

test('schema rejects conflicting active occupancy while retaining failed attempts at reused positions',async()=>{
 const record=run(),pod=plant(record);record.devices[0].pods.push({...pod,_id:'697000000000000000000006'});
 await assert.rejects(new HydroSystem(record).validate(),/same position/);
 pod.germinationStatus='failed';pod.failedAt=now;pod.removedAt=now;
 await new HydroSystem(record).validate();
});

test('optimistic database saves prevent simultaneous moves from both committing',async()=>{
 const record=run();plant(record);const raw=new HydroSystem({...record,__v:0}).toObject();
 const first=HydroSystem.hydrate(JSON.parse(JSON.stringify(raw))),second=HydroSystem.hydrate(JSON.parse(JSON.stringify(raw)));
 first.devices[0].pods[0].position=2;second.devices[0].pods[0].position=3;
 const update=HydroSystem.collection.updateOne;let version=0;
 HydroSystem.collection.updateOne=async query=>{if(query.__v!==version)return {matchedCount:0,modifiedCount:0};version++;return {matchedCount:1,modifiedCount:1};};
 try{const results=await Promise.allSettled([first.save(),second.save()]);assert.equal(results.filter(result=>result.status==='fulfilled').length,1);assert.equal(results.find(result=>result.status==='rejected').reason.name,'VersionError');}finally{HydroSystem.collection.updateOne=update;}
});
