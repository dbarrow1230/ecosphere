import test from 'node:test';
import assert from 'node:assert/strict';
import {recordsInYear,harvestWeightLb,buildHarvestItems} from '../backend/controllers/dashboard/dashboardSnapshotController.js';

test('seasonal review uses the selected recorded year and retains every available year in source data',()=>{
 const rows=[{harvestDate:'2024-12-14'},{harvestDate:'2025-07-11'},{harvestDate:'2026-01-09'},{harvestDate:null}];
 assert.deepEqual(recordsInYear(rows,'harvestDate',2024),[rows[0]]);
 assert.deepEqual(recordsInYear(rows,'harvestDate','2026'),[rows[2]]);
 assert.equal(rows.length,4);
});

test('recorded harvest quantities appear in seasonal totals without treating count units as weight',()=>{
 assert.ok(Math.abs(harvestWeightLb({harvestQuantity:453.592,quantityUnit:'g'})-1)<1e-10);
 assert.equal(harvestWeightLb({harvestQuantity:16,quantityUnit:'oz'}),1);
 assert.equal(harvestWeightLb({harvestQuantity:12,quantityUnit:'fruit'}),null);
 assert.equal(harvestWeightLb({harvestAmount:{g:0},harvestQuantity:20,quantityUnit:'g'}),0);
 const rows=buildHarvestItems([{planting:{instanceName:'Saved crop'},harvestDate:'2024-12-14',harvestQuantity:16,quantityUnit:'oz'}]);
 assert.equal(rows[0].name,'Saved crop');
 assert.equal(rows[0].totalHarvested,'1 lb');
 assert.equal(rows[0].monthly[11],1);
 assert.equal(buildHarvestItems([{harvestDate:'2024-12-14',harvestQuantity:12,quantityUnit:'fruit'}])[0].totalHarvested,'Weight not recorded');
});
