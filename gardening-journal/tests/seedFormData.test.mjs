import test from 'node:test';import assert from 'node:assert/strict';
import {seedFormValues} from '../src/utils/seedFormData.js';
import {cleanSeedData} from '../backend/controllers/seeds/seedController.js';
test('editing and saving a seed retains lifespan, season and zone descriptions',()=>{
 const source={plantName:'Basil',lifecycleInformation:{lifespanDescription:'90 days'},growthInformation:{usdaZoneRange:'3A, 3B'},plantingInformation:{seasonDescription:'Spring'}};
 const payload=cleanSeedData(seedFormValues(source));
 assert.equal(payload.lifecycleInformation.lifespanDescription,'90 days');assert.equal(payload.plantingInformation.seasonDescription,'Spring');assert.equal(payload.growthInformation.usdaZoneRange,'3A, 3B');
});
test('empty seed measurements remain absent through form and backend, while genuine zero is preserved',()=>{
 const payload=cleanSeedData(seedFormValues({growthInformation:{matureSize:{height:{minIn:0,maxIn:null}}}}));
 assert.equal(payload.growthInformation.matureSize.height.minIn,0);assert.equal(payload.growthInformation.matureSize.height.maxIn,null);assert.equal(payload.growthInformation.matureSize.width.minCm,null);
});
