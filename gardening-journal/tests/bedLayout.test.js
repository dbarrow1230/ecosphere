import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import GardenSection from "../backend/models/gardens/gardenSectionModel.js";
import {normalizeBedLayout,placeBedItem,resizeBedLayout} from "../src/utils/growing/bedLayout.js";
const basil={label:"Basil",sourceType:"seed",sourceId:"seed-basil"};
const section=bedLayout=>new GardenSection({garden:new mongoose.Types.ObjectId(),type:new mongoose.Types.ObjectId(),name:"Bed A",bedLayout});

test("placing and moving crops keeps the rest of the bed intact",()=>{
 let plan=placeBedItem(normalizeBedLayout(),basil,0,0);
 plan=placeBedItem(plan,{label:"Tomato",sourceType:"plant"},1,1);
 plan=placeBedItem(plan,basil,2,2,{row:0,column:0});
 assert.equal(plan.cells.length,2);
 assert.equal(plan.cells.find(cell=>cell.row===2).label,"Basil");
 assert.ok(!plan.cells.some(cell=>cell.row===0&&cell.column===0));
 assert.equal(plan.cells.find(cell=>cell.row===1).label,"Tomato");
});
test("occupied drops and shrinking over crops cannot erase placements",()=>{
 const plan=placeBedItem(normalizeBedLayout(),basil,3,7);
 assert.throws(()=>placeBedItem(plan,{label:"Tomato"},3,7),/occupied/);
 assert.throws(()=>resizeBedLayout(plan,2,2),/Move or remove/);
 assert.equal(plan.cells[0].label,"Basil");
 assert.throws(()=>placeBedItem(plan,basil,-1,0),/inside/);
});
test("bed layout survives schema serialization with its scale and source",async()=>{
 const plan={...placeBedItem(normalizeBedLayout(),basil,0,0),cellSize:30,unit:"cm"};
 const saved=section(plan);await saved.validate();
 const restored=section(saved.toObject().bedLayout);await restored.validate();
 assert.deepEqual(normalizeBedLayout(restored.bedLayout),plan);
});
test("backend rejects duplicate coordinates and placements outside the bed",async()=>{
 await assert.rejects(section({rows:2,columns:2,cells:[{...basil,row:3,column:0}]}).validate(),/outside/);
 await assert.rejects(section({rows:2,columns:2,cells:[{...basil,row:0,column:0},{...basil,row:0,column:0}]}).validate(),/Only one/);
 await assert.rejects(section({rows:2.5,columns:2}).validate());
});
