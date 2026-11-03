import test from 'node:test';import assert from 'node:assert/strict';
import {plantFormValues,plantFormPayload} from '../src/utils/plantFormData.js';
import {normalizeLegacyPlant} from '../backend/services/legacyRecordFields.js';
test('plant form preserves zero, false, nullable fields and saved notes on edit',()=>{
 const source={_id:'69753202400207e36df13768',name:'Basil',type:{_id:'69555243665e92102248facc'},spacing:{metric:0,imperial:null},plantingRecord:{indoors:false,outdoors:true,sunExposureHours:0,plantedDate:'2024-03-06T00:00:00.000Z'},notes:[{note:'Original',date:'2024-04-01',createdBy:'69753202400207e36df13768'}],careCard:{variety:'Keep this'}};
 const payload=plantFormPayload(plantFormValues(source),source);
 assert.equal(payload.type,source.type._id);assert.equal(payload.spacing.metric,0);assert.equal(payload.spacing.imperial,null);assert.equal(payload.plantingRecord.indoors,false);assert.equal(payload.plantingRecord.sunExposureHours,0);assert.deepEqual(payload.notes,source.notes);assert(!('careCard' in payload));assert(!('createdBy' in payload));
});
test('new plant form accepts an empty initial record',()=>{const form=plantFormValues(null);form.name='New plant';const payload=plantFormPayload(form,null);assert.equal(payload.name,'New plant');assert.equal(payload.type,null);assert.equal(payload.plantingRecord.plantedDate,null);});
test('actual legacy planting details and valid seed links are retained without guessing numeric references',()=>{
 const plant=normalizeLegacyPlant({plant_name:'Basil',SeedID:'69753202400207e36df13768',plant_type_id:'4',DatePlanted:'2024-03-06',UntimelyDeathDate:'2024-04-09',SunDirection:'West',SunExposureTime:'4',indoors:true,outdoors:false});
 assert.equal(plant.seed,'69753202400207e36df13768');assert.equal(plant.type,undefined);assert.equal(plant.plantingRecord.deathDate,'2024-04-09');assert.equal(plant.growingConditions.sunlight,'West · 4 hours');
});
