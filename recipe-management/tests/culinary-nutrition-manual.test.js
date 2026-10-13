import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {transformSync} from "esbuild";
const source=fs.readFileSync(new URL("../backend/controllers/recipes/RecipeController.js",import.meta.url),"utf8").replace(/^import .*;\r?$/gm,"");
const compiled=transformSync(source,{format:"cjs",loader:"js"}).code;
const load=(Recipe,enrichNutrition)=>{const module={exports:{}};new Function("Recipe","enrichNutrition","module","exports",compiled)(Recipe,enrichNutrition,module,module.exports);return module.exports.syncRecipeNutrition;};
const response=()=>({code:200,status(value){this.code=value;return this;},json(value){this.payload=value;return this;}});
test("nutrition status requests cannot start a USDA calculation",async()=>{
 let calls=0;const sync=load({findOneAndUpdate(){calls++;}},async()=>{calls++;});const res=response();await sync({params:{id:"recipe"},body:{}},res);assert.equal(res.code,400);assert.equal(calls,0);
});
test("explicit USDA update waits for the requested recipe calculation and returns its saved result",async()=>{
 const previous=process.env.USDA_API_KEY;process.env.USDA_API_KEY="test-only";
 try{let calculations=0;let saved;const Recipe={findOneAndUpdate:()=>({populate(){return this;},lean:async()=>({_id:"recipe",ingredients:[],nutrition:{calories:"old"}})}),collection:{updateOne:async(_guard,update)=>{saved=update.$set;return{matchedCount:1};}}};
 const sync=load(Recipe,async recipe=>{calculations++;assert.equal(recipe._id,"recipe");return{status:"complete",nutrition:{calories:"100"},issues:[]};});const res=response();await sync({params:{id:"recipe"},body:{force:true}},res);assert.equal(calculations,1);assert.equal(res.payload.nutritionSync.status,"complete");assert.equal(saved.nutrition.calories,"100");assert.equal(res.payload.nutrition.calories,"100");
 }finally{if(previous===undefined)delete process.env.USDA_API_KEY;else process.env.USDA_API_KEY=previous;}
});
test("failed manual nutrition updates do not schedule background retries",async()=>{
 const previous=process.env.USDA_API_KEY;process.env.USDA_API_KEY="test-only";
 try{let saved;const Recipe={findOneAndUpdate:()=>({populate(){return this;},lean:async()=>({_id:"recipe"})}),collection:{updateOne:async(_guard,update)=>{saved=update.$set;return{matchedCount:1};}}};const sync=load(Recipe,async()=>{throw new Error("USDA unavailable");});const res=response();await sync({params:{id:"recipe"},body:{force:true}},res);assert.equal(res.code,500);assert.equal(saved.nutritionSync.status,"error");assert.equal(saved.nutritionSync.retryAt,undefined);
 }finally{if(previous===undefined)delete process.env.USDA_API_KEY;else process.env.USDA_API_KEY=previous;}
});
