import test from 'node:test';
import assert from 'node:assert/strict';
import {legacyCycleStatus,canRepairLegacyCycleStatus} from '../backend/services/legacyCycleStatus.js';
test('legacy failed and inactive cycles are never represented as actively growing',()=>{
 assert.equal(legacyCycleStatus('no germination'),'failed');
 assert.equal(legacyCycleStatus('inactive'),'archived');
 assert.equal(legacyCycleStatus('death'),'dead');
 assert.equal(legacyCycleStatus('active'),'active');
});
test('repair accepts generated copies and refuses user edits',()=>{
 const cycle={status:'no germination',date_planted:'2024-02-01',untimely_death_date:null};
 const instance={_id:'source',updatedAt:new Date('2026-01-01')};
 const copy={legacyInstanceId:'source',status:'active',updatedAt:instance.updatedAt,instanceName:'Basil',sourceName:'Basil',plantedDate:new Date('2024-02-01')};
 assert.ok(canRepairLegacyCycleStatus(copy,instance,cycle));
 for(const change of [{status:'seedling'},{updatedAt:new Date('2026-02-01')},{notes:[{note:'Edited'}]},{garden:'assigned'},{failureReason:'User reason'},{instanceName:'Changed name'}])assert.ok(!canRepairLegacyCycleStatus({...copy,...change},instance,cycle));
});
