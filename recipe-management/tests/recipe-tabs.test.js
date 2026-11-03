import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('costing and worksheets open in Recipe Management with the selected recipe and existing tab session',()=>{
 const code=fs.readFileSync(new URL('../src/utils/openRecipeTab.js',import.meta.url),'utf8').replaceAll('export function','function');const opened=[];
 const window={location:{origin:'http://localhost:5197'},open:(...args)=>opened.push(args)};const context={window,URL};vm.createContext(context);vm.runInContext(code,context);
 context.openRecipeCosting('selected recipe');context.openRecipeWorksheet('/recipes/costing-worksheets/recipe-costing','selected recipe');
 for(const [href,target] of opened){const url=new URL(href);assert.equal(url.origin,window.location.origin);assert.equal(url.searchParams.get('recipe'),'selected recipe');assert.equal(target,'_blank');assert.equal(url.searchParams.has('authBridge'),false);}
 assert.equal(new URL(opened[0][0]).pathname,'/recipe-costings');
});
