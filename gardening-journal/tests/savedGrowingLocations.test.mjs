import test from 'node:test';
import assert from 'node:assert/strict';
import {savedGrowingLocations} from '../src/utils/savedGrowingLocations.js';
test('original growing locations remain visible without a new hydro run or garden assignment',()=>{
 const runs=[{_id:'run',location:'Hydroponic System',status:'dead'}];
 const result=savedGrowingLocations([{_id:'rack',location_name:'Hydroponic Rack'},{_id:'hydro',location_name:'Hydroponic System'}],runs,[{_id:'plant',plantingRecord:{location:'Hydroponic System'}}]);
 assert.equal(result.length,2);
 assert.equal(result.find(item=>item.name==='Hydroponic System').runs.length,1);
 assert.equal(result.find(item=>item.name==='Hydroponic System').plants.length,1);
 assert.equal(result.find(item=>item.name==='Hydroponic Rack').runs.length,0);
 assert.equal(runs[0].garden,undefined);
});
test('existing API records supply exact saved names before backend catalogue support reloads',()=>{
 assert.deepEqual(savedGrowingLocations([], [{location:'Hydoponic Strater System'},{location:'Hydoponic Strater System'}]).map(item=>[item.name,item.runs.length]),[['Hydoponic Strater System',2]]);
});
