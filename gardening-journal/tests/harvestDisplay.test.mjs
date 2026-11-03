import test from 'node:test';
import assert from 'node:assert/strict';
import {selectHarvests,harvestQuantityLabel,harvestValueLabel,harvestNotes,shiftHarvestDate} from '../src/utils/harvestDisplay.js';

test('previous and next navigation crosses months and years and clamps leap days',()=>{
 assert.equal(shiftHarvestDate('2026-01-01','day',-1),'2025-12-31');
 assert.equal(shiftHarvestDate('2026-01-31','month',1),'2026-02-28');
 assert.equal(shiftHarvestDate('2024-02-29','year',1),'2025-02-28');
 assert.equal(shiftHarvestDate('2026-01-09','month',-1),'2025-12-09');
});
test('day and month views exclude other dates while history remains accessible',()=>{
 const records=[{harvestDate:'2024-12-14T00:00:00Z'},{harvestDate:'2024-12-10T00:00:00Z'},{harvestDate:'2026-01-09T00:00:00Z'}];
 assert.equal(selectHarvests(records,{year:'2024',period:'month',date:'2024-12-01'}).length,2);
 assert.equal(selectHarvests(records,{year:'2024',period:'day',date:'2024-12-14'}).length,1);
 assert.equal(selectHarvests(records,{period:'all'}).length,3);
});

test('harvest view defaults to the current year and retains chronological history explicitly',()=>{
 const records=[{harvestDate:'2024-12-01'},{harvestDate:'2026-01-09'},{harvestDate:'2025-07-11'},{harvestDate:'2026-06-02'}];
 assert.deepEqual(selectHarvests(records,{year:'2026'}).map(item=>item.harvestDate),['2026-06-02','2026-01-09']);
 assert.equal(selectHarvests(records,{year:'all'}).length,4);
 assert.equal(records.length,4);
});
test('garden and search filters remain scoped to the selected year',()=>{
 const records=[{harvestDate:'2026-01-01',planting:{garden:{_id:'garden-a'},sourceName:'Basil'}},{harvestDate:'2025-01-01',planting:{garden:{_id:'garden-a'},sourceName:'Basil'}},{harvestDate:'2026-02-01',planting:null}];
 assert.equal(selectHarvests(records,{year:'2026',garden:'garden-a',search:'basil'}).length,1);
 assert.equal(selectHarvests(records,{year:'2026',garden:'unassigned'}).length,1);
});
test('legacy quantities display as yields and missing prices never become zero prices',()=>{
 assert.equal(harvestQuantityLabel({harvestQuantity:15,quantityUnit:'g'}),'15 g');
 assert.equal(harvestQuantityLabel({harvestQuantity:0,quantityUnit:'g'}),'0 g');
 assert.equal(harvestValueLabel({harvestQuantity:15,storeUnitValue:null}),'Not recorded');
 assert.equal(harvestValueLabel({harvestQuantity:15,storeUnitValue:0,currency:'USD'}),'0.00 USD');
 assert.equal(harvestValueLabel({pricingSnapshot:{totalValue:12.5}}),'12.50');
});
test('editing a harvest retains other notes, original authors and timestamps',()=>{
 const notes=[{note:'First',createdBy:'owner',date:'2024-01-01'},{note:'Second',date:'2024-02-01'}];
 assert.deepEqual(harvestNotes('Edited',{notes},'editor'),[{...notes[0],note:'Edited'},notes[1]]);
 assert.equal(notes[0].note,'First');
});
