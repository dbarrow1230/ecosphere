import test from 'node:test';
import assert from 'node:assert/strict';
import {vendorDisplayText} from '../src/utils/vendorDisplay.js';
test('vendor fields render current and legacy location labels rather than objects',()=>{
 assert.equal(vendorDisplayText({_id:'id',state_name:'New York',state_abbrev:'NY'}),'New York');
 assert.equal(vendorDisplayText({name:'United States'}),'United States');
 assert.equal(vendorDisplayText({_id:'id'}),'');
 assert.equal(vendorDisplayText(['One','Two']),'One, Two');
});
