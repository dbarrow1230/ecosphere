import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import {buildCompanionLibrary,mergeLibraryCompanions} from "../backend/services/companionLibrary.js";
import CompanionPlanting from "../backend/models/planning/companionPlantingModel.js";

const seeds=[
 {_id:"tomato",plantName:"Tomato",plantingInformation:{companionPlants:["basil","missing"]}},
 {_id:"basil",plantName:"Basil"}
];

test("seed references resolve against the catalog and missing references are skipped",()=>{
 const library=buildCompanionLibrary(seeds,[]);
 const tomato=library.find(item=>item.libraryId==="tomato");
 assert.equal(tomato.companions.length,1);
 assert.equal(tomato.companions[0].name,"Basil");
 assert.equal(tomato.companions[0].inherited,true);
 assert.equal(tomato.companions[0].source,"Seed Catalog");
});

test("plant library combines its compatibility fields with its linked seed companions",()=>{
 const library=buildCompanionLibrary(seeds,[{_id:"plant-1",name:"Patio Tomato",seed:"tomato",careCard:{compatible:"Basil, Marigold",incompatible:"Fennel; Dill",repellentFor:"Aphids"}}]);
 const plant=library.find(item=>item.libraryType==="plant");
 assert.deepEqual(plant.companions.map(row=>row.name),["Basil","Marigold","Fennel","Dill"]);
 assert.equal(plant.companions.find(row=>row.name==="Fennel").relationship,"incompatible");
 assert.ok(!plant.companions.some(row=>row.name==="Aphids"));
});

test("existing library relationships appear without log entries and remain current after catalog edits",()=>{
 const initial=buildCompanionLibrary(seeds,[]);
 const saved=[{_id:"log-1",name:"Old name",libraryType:"seed",libraryId:"tomato",companions:[{name:"Marigold",relationship:"compatible",notes:"My observation"}]}];
 const rows=mergeLibraryCompanions(saved,initial);
 assert.equal(rows.length,2);
 const selected=rows.find(row=>row.libraryId==="tomato");
 assert.equal(selected.name,"Tomato");
 assert.equal(selected.companions.length,2);
 assert.equal(mergeLibraryCompanions([],initial).find(row=>row.libraryId==="tomato").companions[0].name,"Basil");
 const changed=buildCompanionLibrary([{...seeds[0],plantingInformation:{companionPlants:[]}},seeds[1]],[]);
 const updated=mergeLibraryCompanions(saved,changed).find(row=>row.libraryId==="tomato");
 assert.deepEqual(updated.companions.map(row=>row.name),["Marigold"]);
 assert.equal(updated.companions[0].notes,"My observation");
});

test("linked log can store just additions while unlinked records still need companions",async()=>{
 await new CompanionPlanting({name:"Tomato",libraryType:"seed",libraryId:new mongoose.Types.ObjectId(),companions:[]}).validate();
 await assert.rejects(new CompanionPlanting({name:"Tomato",companions:[]}).validate(),/at least one/);
});


test("trap and cover crops resolve independently and follow a plant's linked seed",()=>{
 const catalog=buildCompanionLibrary([
  {_id:"tomato",plantName:"Tomato",plantingInformation:{companionPlants:["basil"],trapCrops:["mustard"],coverCrops:["clover"]}},
  {_id:"basil",plantName:"Basil"},{_id:"mustard",plantName:"Mustard"},{_id:"clover",plantName:"Clover"}
 ],[{_id:"plant",name:"Patio Tomato",seed:"tomato"}]);
 for(const row of catalog.filter(row=>["Tomato","Patio Tomato"].includes(row.name))){
  assert.deepEqual(row.trapCrops.map(crop=>crop.name),["Mustard"]);
  assert.deepEqual(row.coverCrops.map(crop=>crop.name),["Clover"]);
  assert.deepEqual(row.companions.map(crop=>crop.name),["Basil"]);
  assert.equal(row.sourceSeedId,"tomato");
 }
});
