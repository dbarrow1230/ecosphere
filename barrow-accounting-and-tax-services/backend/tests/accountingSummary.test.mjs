import {test} from "node:test";
import assert from "node:assert/strict";
import {accountingSummary} from "../services/dashboard/accountingSummary.js";

const clients=[{_id:"a",status:"active",assignedTo:{_id:"staff",username:"Accountant"}},{_id:"b",status:"inactive",assignedTo:null}];
const work=[{client:{_id:"a"},status:"In progress",dueDate:"2026-10-28"},{client:{_id:"a"},status:"Waiting on client",dueDate:"2026-10-29"},{client:{_id:"b"},status:"Not started",dueDate:"2026-11-05"},{client:{_id:"b"},status:"Not started",dueDate:"2026-11-06"},{client:{_id:"a"},status:"Completed",dueDate:"2026-10-01"},{client:{_id:"b"},status:"Cancelled",dueDate:"2026-10-01"}];
test("accounting summary excludes closed work from open, overdue, and due-soon counts",()=>{
 const result=accountingSummary(clients,work,{owner:true,now:new Date("2026-10-29T12:00:00Z")});
 assert.equal(result.totalClients,2);assert.equal(result.activeClients,1);assert.equal(result.openWork,4);assert.equal(result.overdue,1);assert.equal(result.dueSoon,2);assert.equal(result.waitingOnClient,1);
});
test("owner workload includes assigned and unassigned client records",()=>{
 const result=accountingSummary(clients,work,{owner:true});
 assert.equal(result.unassignedClients,1);
 assert.deepEqual(result.assignments,[{id:"staff",name:"Accountant",clients:1,openWork:2},{id:"unassigned",name:"Unassigned",clients:1,openWork:2}]);
});
test("staff summaries omit practice-wide assignment information",()=>{
 const result=accountingSummary(clients.slice(0,1),work.filter(item=>item.client._id==="a"));
 assert.equal(result.totalClients,1);assert.equal(result.unassignedClients,null);assert.deepEqual(result.assignments,[]);
});
test("empty database produces zero counts without fictional client or work records",()=>{
 const result=accountingSummary([],[],{owner:true});
 assert.equal(result.totalClients,0);assert.equal(result.openWork,0);assert.equal(result.overdue,0);assert.deepEqual(result.assignments,[]);
});
