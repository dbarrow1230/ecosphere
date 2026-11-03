import {test} from "node:test";
import assert from "node:assert/strict";
import {clientScope,assignmentFor} from "../controllers/clientPolicy.js";

const request=(owner=false,body={})=>({user:{_id:"user-a"},canManageAllClients:owner,body});
test("owner lists every client including unassigned records",()=>assert.deepEqual(clientScope(request(true)),{}));
test("other accounts are restricted to their own assigned clients",()=>{
 assert.deepEqual(clientScope(request()),{assignedTo:"user-a"});
 assert.deepEqual(clientScope({...request(),query:{assignedTo:"user-b"}}),{assignedTo:"user-a"});
});
test("non-owners cannot assign new records to someone else",()=>assert.equal(assignmentFor(request(false,{assignedTo:"user-b"}),true),"user-a"));
test("non-owners cannot reassign or unassign existing records",()=>{
 assert.equal(assignmentFor(request(false,{assignedTo:"user-b"}),false),undefined);
 assert.equal(assignmentFor(request(false,{assignedTo:null}),false),undefined);
});
test("owner can assign, reassign, and unassign clients",()=>{
 assert.equal(assignmentFor(request(true,{assignedTo:"user-b"}),true),"user-b");
 assert.equal(assignmentFor(request(true,{assignedTo:"user-c"}),false),"user-c");
 assert.equal(assignmentFor(request(true,{assignedTo:""}),false),null);
 assert.equal(assignmentFor(request(true),false),undefined);
});
