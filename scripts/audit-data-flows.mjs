import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath,pathToFileURL} from "node:url";
import mongoose from "mongoose";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const require=createRequire(path.join(root,"package.json"));
const mongooseUrl=pathToFileURL(require.resolve("mongoose")).href;
const apps=[".","everything-in-a-jar","green-table-grocers","from-the-ground-up","novel-planner","shopping-manager","itm-fire-protection"];
let checks=0;
async function loadSource(source,label){
 return import("data:text/javascript;base64,"+Buffer.from(source+"\n// "+label).toString("base64"));
}
async function loadModel(modelPath){
 let source=await fs.readFile(modelPath,"utf8");
 source=source.replace(/import mongoose from ["']mongoose["'];?/,"import mongoose from "+JSON.stringify(mongooseUrl)+";");
 source=source.replace(/import businessInfoConnection from ["'][^"']+["'];?/,"const businessInfoConnection=globalThis.auditConnection;");
 globalThis.auditConnection=mongoose.createConnection();
 return (await loadSource(source,modelPath)).default;
}
function response(){
 return {statusCode:200,body:null,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
}
for(const app of apps){
 const appRoot=path.join(root,app==="."?"":app);
 const Model=await loadModel(path.join(appRoot,"backend/models/reference/AllergenModel.js"));
 const records=new Map();
 globalThis.auditStore={
  async create(payload){const doc=new Model(payload);await doc.validate();records.set(String(doc._id),doc);return doc;},
  find(query){return {sort:async()=>[...records.values()].filter(doc=>query.isActive===undefined||doc.isActive===query.isActive)};},
  async findById(id){return records.get(String(id))||null;},
  async findByIdAndUpdate(id,payload){const doc=records.get(String(id));if(!doc)return null;for(const [key,value]of Object.entries(payload))if(value!==undefined)doc.set(key,value);await doc.validate();return doc;}
 };
 const source=(await fs.readFile(path.join(appRoot,"backend/controllers/reference/allergenController.js"),"utf8"))
  .replace(/import Allergen from ["'][^"']+["'];?/,"const Allergen=globalThis.auditStore;");
 const controller=await loadSource(source,app);
 let res=response();
 await controller.createAllergen({body:{name:"Audit allergen",code:"test",emoji:"A",description:"Original description",severityLevel:"high",isMajor:true,isActive:true}},res);
 assert.equal(res.statusCode,201,app+" create");checks++;
 const id=String(res.body.data._id);
 assert.equal(res.body.data.description,"Original description");assert.equal(res.body.data.code,"TEST");checks+=2;
 res=response();await controller.getAllergenById({params:{id}},res);
 assert.equal(res.body.data.description,"Original description");checks++;
 res=response();await controller.updateAllergen({params:{id},body:{name:"Audit allergen",code:"TEST",emoji:"B",description:"Updated description",severityLevel:"low",isMajor:false,isActive:true}},res);
 assert.equal(res.statusCode,200);assert.equal(res.body.data.description,"Updated description");assert.equal(res.body.data.severityLevel,"low");assert.equal(res.body.data.isMajor,false);checks+=4;
 res=response();await controller.getAllergens({query:{}},res);assert.equal(res.body.data.length,1);checks++;
 res=response();await controller.deleteAllergen({params:{id}},res);assert.equal(res.body.data.isActive,false);checks++;
 res=response();await controller.getAllergens({query:{}},res);assert.equal(res.body.data.length,0);checks++;
 await globalThis.auditConnection.close();
}
const donorRoot=path.join(root,"from-the-ground-up/backend");
let donorControllerSource=await fs.readFile(path.join(donorRoot,"controllers/donnations/DonorContactController.js"),"utf8");
const importedModel=donorControllerSource.match(/import DonorContact from ["']([^"']+)["']/)[1];
const Donor=await loadModel(path.resolve(donorRoot,"controllers/donnations",importedModel));
const donorRecords=new Map();
globalThis.auditDonorStore={
 async findOne(query){return [...donorRecords.values()].find(doc=>doc.email===query.email)||null;},
 async create(payload){const doc=new Donor(payload);await doc.validate();donorRecords.set(String(doc._id),doc);return doc;},
 findById(id){return {populate:async()=>donorRecords.get(String(id))||null};}
};
donorControllerSource=donorControllerSource.replace(/import DonorContact from ["'][^"']+["'];?/,"const DonorContact=globalThis.auditDonorStore;");
const donorController=await loadSource(donorControllerSource,"donor-controller");
let res=response();await donorController.createDonorContact({body:{name:"Audit Donor",email:"TEST@example.invalid",company:"Audit",mailingOptIn:true}},res);
assert.equal(res.statusCode,201,JSON.stringify(res.body));assert.equal(res.body.email,"test@example.invalid");assert.equal(res.body.name,"Audit Donor");assert.equal(res.body.mailingOptIn,true);checks+=4;
res=response();await donorController.createDonorContact({body:{name:"Audit Donor",email:"test@example.invalid"}},res);assert.equal(res.statusCode,409);checks++;
await globalThis.auditConnection.close();
console.log(JSON.stringify({allergenApplications:apps.length,donorContact:true,checks,status:"passed",databaseWrites:0,mode:"actual schemas and controllers with in-memory model storage"}));
