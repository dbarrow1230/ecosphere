import test from "node:test";
import assert from "node:assert/strict";
import {combineGrowingRuns,summarizeGrowingRuns} from "../src/utils/growing/growingRuns.js";

test("all runs include older plantings and hydro runs without counting pods as runs",()=>{
 const runs=combineGrowingRuns([{_id:"a",plantedDate:"2025-01-01",status:"seedling"}],[{_id:"b",name:"Herb hydro",startedDate:"2026-10-01",devices:[{pods:[1,2,3]}]}]);
 assert.equal(runs.length,2);
 assert.equal(runs[1].plantedDate,"2026-10-01");
 assert.deepEqual(summarizeGrowingRuns(runs),{total:2,active:2,failed:0,harvested:0});
});
test("inactive, dead, failed and harvested runs are not counted as growing",()=>{
 const runs=combineGrowingRuns([{_id:"1",status:"dead"},{_id:"2",status:"failed"},{_id:"3",status:"harvested"},{_id:"4",status:"active",isActive:false},{_id:"5",status:"germinating"}],[{_id:"6",isActive:false}]);
 assert.deepEqual(summarizeGrowingRuns(runs),{total:6,active:1,failed:2,harvested:1});
 assert.equal(runs[5].status,"archived");
});
test("filter summaries describe the visible results and keys separate record kinds",()=>{
 const runs=combineGrowingRuns([{_id:"same",status:"active",garden:"g1"}],[{_id:"same",isActive:true,garden:"g2"}]);
 assert.notEqual(runs[0].runKey,runs[1].runKey);
 assert.equal(summarizeGrowingRuns(runs.filter(run=>run.garden==="g2")).total,1);
 assert.deepEqual(summarizeGrowingRuns([]),{total:0,active:0,failed:0,harvested:0});
});
