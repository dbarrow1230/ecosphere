import test from 'node:test';
import assert from 'node:assert/strict';
import Seed from '../backend/models/seeds/seedModel.js';
import config from '../vite.config.js';

test('legacy seeds hydrate into fields used by pages, forms and population',()=>{
 const species='6973dd46e1cd36659ee4973d';
 const seed=Seed.hydrate({name:'Garlic',species_id:species,image_path:'garlic.jpg',flavor_profile:{taste:'pungent'},growth_info:{min_days_germination:0,max_days_germination:10},start_indoors:{materials_needed:'Trays'},resources_links:{notable_references:[{url:'https://example.org'}]}});
 assert.equal(seed.plantName,'Garlic');
 assert.equal(String(seed.species),species);
 assert.equal(seed.coverImage,'garlic.jpg');
 assert.deepEqual([...seed.taste],['pungent']);
 assert.equal(seed.growthInformation.germinationTime.min,'0');
 assert.deepEqual([...seed.plantingInformation.startIndoors.materialsNeeded],['Trays']);
 assert.deepEqual([...seed.resourcesAndLinks.notableReferenceLinks],['https://example.org']);
});

test('current values and intentional blanks take precedence over legacy fields',()=>{
 const seed=Seed.hydrate({plantName:'Edited',name:'Legacy',coverImage:'',image_path:'old.jpg',vendor:[],vendor_id:['6973dd46e1cd36659ee4973d']});
 assert.equal(seed.plantName,'Edited');
 assert.equal(seed.coverImage,'');
 assert.deepEqual([...seed.vendor],[]);
});

test('uploads reach the backend without intercepting frontend page routes',()=>{
 const proxies=Object.keys(config({mode:'development'}).server.proxy).filter(key=>key.startsWith('^'));
 for(const page of ['/seeds','/plants','/vendors','/seed-collections'])assert.equal(proxies.some(key=>new RegExp(key).test(page)),false);
 assert(proxies.some(key=>new RegExp(key).test('/seed/garlic.jpg')));
});

test('legacy combined management restores both lists with original treatment and prevention',()=>{
 const seed=Seed.hydrate({pest_disease_management:[null,{},
  {pest:'Aphids, spider mites',common_diseases:'Powdery mildew',treatment:'Original treatment',prevention:'Original prevention'},
  {pest:'',common_diseases:'Root rot',treatment:'Improve drainage'}
 ]});
 assert.equal(seed.pestManagement.length,1);
 assert.equal(seed.pestManagement[0].name,'Aphids, spider mites');
 assert.equal(seed.pestManagement[0].treatment,'Original treatment');
 assert.equal(seed.pestManagement[0].prevention,'Original prevention');
 assert.equal(seed.diseaseManagement.length,2);
 assert.equal(seed.diseaseManagement[1].name,'Root rot');
 assert.equal(seed.diseaseManagement[1].treatment,'Improve drainage');
});

test('edited management lists take precedence over legacy notes',()=>{
 const seed=Seed.hydrate({pestManagement:[],diseaseManagement:[{name:'Edited disease'}],pest_disease_management:[{pest:'Old pest',common_diseases:'Old disease'}]});
 assert.equal(seed.pestManagement.length,0);
 assert.equal(seed.diseaseManagement[0].name,'Edited disease');
});

test('legacy separate pest and disease lists use textual names, not reference IDs',()=>{
 const seed=Seed.hydrate({pest_management:[{pest:'Cabbage aphid',treatment:'Neem oil',prevention:'Beneficial insects'}],disease_management:[{common_diseases:'Clubroot',treatment:'Remove infected plants'}]});
 assert.equal(seed.pestManagement[0].name,'Cabbage aphid');
 assert.equal(seed.pestManagement[0].pest,null);
 assert.equal(seed.diseaseManagement[0].name,'Clubroot');
 assert.equal(seed.diseaseManagement[0].disease,null);
});

test('legacy growth uses actual dimensions and retains textual USDA zones and lifespan',()=>{
 const seed=Seed.hydrate({plant_life_span:'Single growing season',planting_seasons:['Spring'],growth_info:{usda_zones:['3A','3B'],mature_size:{height:{value:90,unit:'cm'}}}});
 assert.equal(seed.growthInformation.matureSize.height.minCm,90);
 assert.equal(seed.growthInformation.matureSize.height.minIn,35.43);
 assert.equal(seed.growthInformation.usdaZoneRange,'3A, 3B');
 assert.equal(seed.lifecycleInformation.lifespanDescription,'Single growing season');
 assert.equal(seed.plantingInformation.seasonDescription,'Spring');
});

test('vendor document routes bypass uploads while image requests remain proxied',async()=>{
 const {bypassUploadPageRequest}=await import('../../shared/viteUploadProxy.js');
 for(const url of ['/vendors/seeds','/vendors/equipment','/vendors/supplies'])assert.equal(bypassUploadPageRequest({url,headers:{accept:'text/html'}}),url);
 assert.equal(bypassUploadPageRequest({url:'/vendors/logo.png',headers:{accept:'text/html'}}),undefined);
 assert.equal(bypassUploadPageRequest({url:'/seed/image.jpg?version=1',headers:{accept:'image/avif,image/webp,*/*'}}),undefined);
});

test('unresolved import placeholders stay in legacy data and are not cast as IDs',()=>{
 const seed=Seed.hydrate({reproduction:{propagation_methods:['REPLACE_WITH_PropagationMethod_ObjectId']},growing_conditions:{light_id:'REPLACE_WITH_PlantLighting_ObjectId'}});
 assert.equal(seed.growingConditionsAndRequirements.lightRequirements,null);
 assert.deepEqual([...seed.propagationMethods.method],[]);
 assert.equal(seed.$errors?.['propagationMethods.method.0'],undefined);
 assert.equal(seed.$errors?.['growingConditionsAndRequirements.lightRequirements'],undefined);
});
