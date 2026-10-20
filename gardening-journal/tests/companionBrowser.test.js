import test from "node:test";
import assert from "node:assert/strict";
import {buildCompanionBrowserEntries,compatibleCompanions} from "../src/utils/growing/companionBrowser.js";

test("browser lists all seeds and plants even without recorded companions",()=>{
 const catalog=[
  {libraryKey:"seed:1",libraryType:"seed",libraryId:"1",name:"Tomato",companions:[]},
  {libraryKey:"seed:2",libraryType:"seed",libraryId:"2",name:"Basil",companions:[]},
  {libraryKey:"plant:3",libraryType:"plant",libraryId:"3",name:"Rose",companions:[]}
 ];
 const entries=buildCompanionBrowserEntries(catalog,[]);
 assert.equal(entries.filter(row=>row.libraryType==="seed").length,2);
 assert.equal(entries.filter(row=>row.libraryType==="plant").length,1);
 assert.deepEqual(entries.map(row=>row.name),["Basil","Rose","Tomato"]);
});
test("saved additions replace the selected entry without repeating it",()=>{
 const entry={libraryKey:"seed:1",libraryType:"seed",libraryId:"1",name:"Tomato",companions:[]};
 const entries=buildCompanionBrowserEntries([entry],[{...entry,_id:"record",companions:[{name:"Basil",relationship:"compatible"}]}]);
 assert.equal(entries.length,1);
 assert.equal(entries[0]._id,"record");
 assert.equal(entries[0].companions[0].name,"Basil");
});
test("incompatible plants stay out of the companion list without deleting their data",()=>{
 const record={companions:[{name:"Basil",relationship:"compatible"},{name:"Fennel",relationship:"incompatible"}]};
 assert.deepEqual(compatibleCompanions(record).map(row=>row.name),["Basil"]);
 assert.equal(record.companions.length,2);
});
