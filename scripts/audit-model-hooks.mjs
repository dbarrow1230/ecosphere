import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {parse} from "@babel/parser";
import mongoose from "mongoose";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files=[
  "barrow-coffee-delights/backend/models/users/userRoleAssignmentModel.js",
  "beer-wine-inventory/backend/models/users/rolePermissionModel.js",
  "beer-wine-inventory/backend/models/users/userRoleAssignmentModel.js",
  "catering-management/backend/models/users/userRoleAssignmentModel.js",
  "chorna-lifeboard/backend/models/users/rolePermissionModel.js",
  "chorna-lifeboard/backend/models/users/userRoleAssignmentModel.js",
  "crazy-cravings-alchemy-delight-doughnuts/backend/models/users/userRoleAssignmentModel.js",
  "employee-scheduler/backend/models/employee/employeeModel.js",
  "employee-scheduler/backend/models/users/rolePermissionModel.js",
  "employee-scheduler/backend/models/users/userRoleAssignmentModel.js",
  "gardening-journal/backend/models/growth/plantingDepthModel.js",
  "gardening-journal/backend/models/harvest/harvestModel.js",
  "ham-radio-log/backend/models/reference/antennaReferenceModel.js",
  "ham-radio-log/backend/models/reference/cwReferenceModel.js",
  "ham-radio-log/backend/models/reference/phoneticAlphabetReferenceModel.js",
  "ham-radio-log/backend/models/reference/radioTermModel.js",
  "ham-radio-log/backend/models/reference/referenceOrganizationModel.js",
  "ham-radio-log/backend/models/reference/technicalReferenceModel.js",
  "home-tracker/backend/models/users/userRoleAssignmentModel.js",
  "mentorship-tracking/backend/models/users/rolePermissionModel.js",
  "mentorship-tracking/backend/models/users/userRoleAssignmentModel.js",
  "root-wise-consulting/backend/models/users/rolePermissionModel.js",
  "root-wise-consulting/backend/models/users/userRoleAssignmentModel.js",
  "travel-log/backend/models/users/rolePermissionModel.js",
  "travel-log/backend/models/users/userRoleAssignmentModel.js"
];
function walk(node,visit){
 if(!node||typeof node!=="object")return;
 visit(node);
 for(const [key,value] of Object.entries(node)){
  if(["loc","start","end","extra"].includes(key))continue;
  if(Array.isArray(value))value.forEach(item=>walk(item,visit));
  else if(value&&typeof value==="object")walk(value,visit);
 }
}
let roleResult=null;
let lookupError=null;
let harvestResult=null;
const Role={findById:()=>({select:()=>({lean:async()=>{if(lookupError)throw lookupError;return roleResult;}})})};
const harvestMongoose={model:()=>({findOne:()=>({sort:()=>({select:async()=>harvestResult})})})};
let checks=0;
for(const file of files){
 const source=await fs.readFile(path.join(root,file),"utf8");
 const ast=parse(source,{sourceType:"module"});
 const hooks=[];
 walk(ast,node=>{
  if(node.type!=="CallExpression"||node.callee.property?.name!=="pre")return;
  const fn=node.arguments.find(arg=>arg.type==="FunctionExpression");
  if(!fn)return;
  assert(!fn.params.some(param=>param.name==="next"),file+" retains a callback pre hook");
  const callback=new Function("Role","mongoose","return ("+source.slice(fn.start,fn.end)+")")(Role,harvestMongoose);
  hooks.push({name:node.arguments[0].value,callback});
 });
 for(const hook of hooks){
  const schema=new mongoose.Schema({});
  schema.pre(hook.name,hook.callback);
  const run=context=>schema.s.hooks.execPre(hook.name,context,[]);
  if(file.includes("/users/")){
   lookupError=null;
   roleResult={business:"business-a"};
   await run({role:"role-a",business:"business-a"});checks++;
   roleResult=null;
   await assert.rejects(run({role:"role-a",business:"business-a"}),/Invalid role/);checks++;
   roleResult={business:"business-b"};
   await assert.rejects(run({role:"role-a",business:"business-a"}),/Role does not belong/);checks++;
   await run({role:"",business:""});checks++;
   lookupError=new Error("role lookup failed");
   await assert.rejects(run({role:"role-a",business:"business-a"}),/role lookup failed/);checks++;
   lookupError=null;
  }else if(file.endsWith("/employeeModel.js")){
   const date=new Date("2026-01-03T00:00:00Z");
   const employee={hireDate:date,payType:"salary",overtimeEligible:true};
   await run(employee);
   assert.equal(employee.originalHireDate,date);assert.equal(employee.lastHireDate,date);assert.equal(employee.overtimeEligible,false);checks+=3;
   const hourly={payType:"hourly",overtimeEligible:true};await run(hourly);assert.equal(hourly.overtimeEligible,true);checks++;
  }else if(file.endsWith("/plantingDepthModel.js")){
   const inches={inches:2,centimeters:null};await run(inches);assert.equal(inches.centimeters,5.08);checks++;
   const centimeters={centimeters:5.08,inches:null};await run(centimeters);assert.equal(centimeters.inches,2);checks++;
   const both={centimeters:7,inches:2};await run(both);assert.equal(both.centimeters,7);checks++;
  }else if(file.endsWith("/harvestModel.js")){
   harvestResult={harvestDate:new Date("2026-01-01T00:00:00Z")};
   const harvest={isNew:true,planting:"planting-a",harvestDate:new Date("2026-01-04T00:00:00Z")};
   await run(harvest);assert.equal(harvest.daysSinceLastHarvest,3);assert.equal(harvest.lastHarvested,harvestResult.harvestDate);checks+=2;
   harvestResult=null;await run({isNew:true});checks++;
   const existing={isNew:false,daysSinceLastHarvest:9};await run(existing);assert.equal(existing.daysSinceLastHarvest,9);checks++;
  }else{
   const entry={title:"  Sample Title  ",symbol:"  Z  ",term:"  Sample Term  ",name:"  Sample Name  "};
   await run(entry);
   const field=file.endsWith("phoneticAlphabetReferenceModel.js")?"symbol":file.endsWith("radioTermModel.js")?"term":file.endsWith("referenceOrganizationModel.js")?"name":"title";
   assert.equal(entry.key,entry[field].trim().toLowerCase());checks++;
  }
 }
}
console.log(JSON.stringify({files:files.length,checks,status:"passed",databaseWrites:0}));
