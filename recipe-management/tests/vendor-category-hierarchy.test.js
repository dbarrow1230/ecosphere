import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryPath,categoryWithin} from '../src/utils/vendorCategories.js';
const categories=[{_id:'p',name:'Produce'},{_id:'v',name:'Vegetables',parent:'p'},{_id:'m',name:'Mushrooms',parent:'v'}];
test('category paths retain every parent and main category filters include descendants',()=>{assert.equal(categoryPath(categories[2],categories),'Produce → Vegetables → Mushrooms');assert.equal(categoryWithin('m','p',categories),true);assert.equal(categoryWithin('p','m',categories),false);assert.equal(categoryWithin('uncategorized','uncategorized',categories),true);});
test('malformed legacy cycles cannot hang category rendering',()=>{const cycle=[{_id:'a',name:'A',parent:'b'},{_id:'b',name:'B',parent:'a'}];assert.equal(categoryPath(cycle[0],cycle),'');assert.equal(categoryWithin('a','missing',cycle),false);});

test('one category supports multiple parent links while product paths stay specific',()=>{const categories=[{_id:'produce',name:'Produce',parents:[null]},{_id:'frozen',name:'Frozen',parents:[null]},{_id:'vegetables',name:'Vegetables',parents:['produce','frozen']}];assert.equal(categoryWithin('vegetables','produce',categories),true);assert.equal(categoryWithin('vegetables','frozen',categories),true);assert.equal(categoryPath(categories[2],categories,['frozen','vegetables']),'Frozen → Vegetables');assert.equal(categoryPath(categories[2],categories,['produce','vegetables']),'Produce → Vegetables');});
