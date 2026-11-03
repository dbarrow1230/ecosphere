import {cleanIngredientName} from "../../shared/culinary/ingredientRows.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function controller(models){const context={...models,cleanIngredientName};vm.createContext(context);const source=fs.readFileSync(new URL('../backend/controllers/recipes/IngredientController.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export const','const');vm.runInContext(source+'\nglobalThis.api={updateIngredient,deleteIngredient,createIngredient};',context);return context.api;}
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}});
test('merged ingredient updates preserve costing metadata, units, notes, and inactive state',async()=>{
 let payload;const existing={name:'Old',unit:'kg',notes:'Keep',business:'business',category:'category',isCostingIngredient:true,isActive:false};const api=controller({Ingredient:{findById:async()=>({toObject:()=>existing}),findByIdAndUpdate:async(id,value)=>{payload=value;return{_id:id,...value};}}});const res=response();await api.updateIngredient({params:{id:'ingredient'},body:{name:'Corrected'}},res);assert.equal(res.statusCode,200);assert.equal(payload.unit,'kg');assert.equal(payload.notes,'Keep');assert.equal(payload.business,'business');assert.equal(payload.category,'category');assert.equal(payload.isCostingIngredient,true);assert.equal(payload.isActive,false);assert.equal(payload.ingredientName,'Corrected');
});
test('merged ingredient deletion refuses references from each participating collection',async()=>{
 for(const linked of ['Recipe','RecipeCosting','VendorIngredientPrice']){let deleted=false;const models={Ingredient:{findByIdAndDelete:async()=>{deleted=true;return{};}}};for(const name of ['Recipe','RecipeCosting','VendorIngredientPrice'])models[name]={countDocuments:async()=>name===linked?1:0};const res=response();await controller(models).deleteIngredient({params:{id:'ingredient'}},res);assert.equal(res.statusCode,409);assert.equal(deleted,false);}
});
