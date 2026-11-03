import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateLegacyJournalData,legacyCollectionRules} from '../backend/services/migrateLegacyJournalData.js';
import {normalizeLegacyPlant,normalizeLegacySpecies,normalizeLegacyTask,normalizeLegacyJournalEntry} from '../backend/services/legacyRecordFields.js';

test('migration preserves source IDs and never overwrites a current record on rerun',async()=>{
 const storage=new Map([['species_families',[{_id:'existing',name:'Old value'},{_id:'new',name:'Lamiaceae'}]],['families',[{_id:'existing',name:'Edited value'}]]]);
 const db={collection:name=>({find:()=>storage.get(name)||[],findOne:async query=>(storage.get(name)||[]).find(row=>row._id===query._id),updateOne:async(query,update)=>{
  assert.deepEqual(Object.keys(update),['$setOnInsert']);
  const rows=storage.get(name)||[];
  if(rows.some(row=>row._id===query._id))return {upsertedCount:0};
  rows.push(update.$setOnInsert);storage.set(name,rows);return {upsertedCount:1};
 }})};
 await migrateLegacyJournalData(db);
 await migrateLegacyJournalData(db);
 assert.deepEqual(storage.get('families').map(r=>[r._id,r.name]),[['existing','Edited value'],['new','Lamiaceae']]);
 assert.equal(storage.get('species_families')[0].name,'Old value');
});

test('same-collection aliases restore names and dates without replacing edits',()=>{
 assert.equal(normalizeLegacyPlant({plant_name:'Sweet Basil'}).name,'Sweet Basil');
 assert.equal(normalizeLegacyPlant({name:'Edited',plant_name:'Old'}).name,'Edited');
 assert.equal(normalizeLegacySpecies({botanical_name:'Ocimum basilicum',common_names:'Basil'}).botanicalName,'Ocimum basilicum');
 assert.equal(normalizeLegacyTask({task_name:'Water',due_date:'2026-01-01',is_completed:true}).status,'completed');
 assert.equal(normalizeLegacyTask({name:'Edited',task_name:'Old',status:'pending',is_completed:true}).status,'pending');
});

test('reference conversions keep genuine source values and parse negative temperature ranges',()=>{
 const convert=legacyCollectionRules.find(([source])=>source==='hardiness_zones')[2];
 const zone=convert({zone:'1A',tempF:'-60°F to -55°F',tempC:'-51.1°C to -48.3°C'});
 assert.deepEqual(zone.temperatureRange.fahrenheit,{min:-60,max:-55});
 assert.deepEqual(zone.temperatureRange.celsius,{min:-51.1,max:-48.3});
});

test('legacy journal note strings and objects retain their text and original dates',()=>{
 const date='2025-01-01';
 assert.deepEqual(normalizeLegacyJournalEntry({entryDate:date,notes:['Trimmed roots']}).notes,[{note:'Trimmed roots',date}]);
 assert.deepEqual(normalizeLegacyJournalEntry({notes:{note:'Watered',note_date:date}}).notes,[{note:'Watered',note_date:date,date}]);
});

test('each growing cycle is restored once, preserving death dates and original source',async()=>{
 const storage=new Map([['plant_instances',[{_id:'original-instance',plantings:[{date_planted:'2024-01-01',status:'death',untimely_death_date:'2024-02-01'},{date_planted:'2024-03-01',status:'active'}]}]]]);
 const matches=(row,query)=>Object.entries(query).every(([key,value])=>String(row[key])===String(value));
 const db={collection:name=>({find:()=>storage.get(name)||[],findOne:async query=>(storage.get(name)||[]).find(row=>matches(row,query)),updateOne:async(query,update)=>{
  const rows=storage.get(name)||[];
  if(rows.some(row=>matches(row,query)))return {upsertedCount:0};
  rows.push({...query,...update.$setOnInsert});storage.set(name,rows);return {upsertedCount:1};
 }})};
 await migrateLegacyJournalData(db);await migrateLegacyJournalData(db);
 const rows=storage.get('plantings');
 assert.equal(rows.length,2);
 assert.equal(rows[0]._id,'original-instance');
 assert.equal(rows[0].status,'dead');
 assert.equal(rows[0].deathDate.toISOString().slice(0,10),'2024-02-01');
 assert.equal(rows[1].legacyCycleIndex,1);
 assert.equal(storage.get('plant_instances')[0].plantings.length,2);
});
