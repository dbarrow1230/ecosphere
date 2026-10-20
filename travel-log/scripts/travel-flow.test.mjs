import {test} from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Model from "../backend/models/travel/travelLogModel.js";
import {logFields} from "../src/config/travelFields.js";
import * as controller from "../backend/controllers/travel/travelLogController.js";
import router from "../backend/routes/travel/travelLogRoutes.js";

const owner=new mongoose.Types.ObjectId();
const other=new mongoose.Types.ObjectId();
const id=new mongoose.Types.ObjectId().toString();
function response(){return {code:200,status(value){this.code=value;return this;},json(value){this.body=value;return this;}};}
function request(body={},user=owner){return {body,user:{_id:user},params:{id},query:{}};}

test("all template fields exist in the persisted model",()=>{
 for(const fields of Object.values(logFields))for(const field of fields)assert.ok(Model.schema.path(field.name),field.name);
});
test("model rejects missing titles, impossible dates, and out-of-range ratings",async()=>{
 for(const data of [{date:"2026-10-18"},{title:"Test",date:"2026-02-30"},{title:"Test",date:"2026-10-18",rating:6}]){
  await assert.rejects(new Model({kind:"hiking",user:owner,...data}).validate());
 }
});
test("create whitelists fields and binds ownership to the authenticated account",async()=>{
 const original=Model.create;
 let saved;
 Model.create=async payload=>{const doc=new Model(payload);await doc.validate();saved=doc;return doc;};
 try {
  const res=response();
  await controller.create(request({kind:"hiking",title:"Ridge",date:"2026-10-18",terrain:"Rocky",gear:"Boots",rating:"4",user:other,isAdmin:true}),res);
  assert.equal(res.code,201);assert.equal(saved.user.toString(),owner.toString());assert.equal(saved.terrain,"Rocky");assert.equal(saved.rating,4);assert.equal(saved.isAdmin,undefined);
 } finally {Model.create=original;}
});
test("create rejects invalid kinds",async()=>{
 for(const kind of ["unknown","constructor","__proto__"]){const res=response();await controller.create(request({kind}),res);assert.equal(res.code,400);}
});
test("list scopes by account and log type",async()=>{
 const original=Model.find;let filter;
 Model.find=value=>{filter=value;return {sort:()=>({lean:async()=>[]})};};
 try {
  const req=request();req.query.kind="travel";const res=response();await controller.list(req,res);
  assert.deepEqual(filter,{user:owner,kind:"travel"});assert.deepEqual(res.body.logs,[]);
  req.query.kind="constructor";await controller.list(req,res);assert.equal(res.code,400);
 } finally {Model.find=original;}
});
test("details return 404 for records outside the account",async()=>{
 const original=Model.findOne;let filter;
 Model.findOne=value=>{filter=value;return {lean:async()=>null};};
 try {const res=response();await controller.get(request(),res);assert.equal(res.code,404);assert.deepEqual(filter,{_id:id,user:owner});}
 finally {Model.findOne=original;}
});
test("updates retain kind and owner, validate, and preserve all hiking fields",async()=>{
 const original=Model.findOne;let filter;let saved=false;
 const log=new Model({_id:id,user:owner,kind:"hiking",title:"Before",date:"2026-10-18"});
 log.save=async()=>{await log.validate();saved=true;return log;};
 Model.findOne=async value=>{filter=value;return log;};
 try {
  const body=Object.fromEntries(logFields.hiking.map(field=>[field.name,field.name==="date" ? "2026-10-19" : field.type==="number" ? "3" : `Saved ${field.name}`]));
  const res=response();await controller.update(request({...body,kind:"travel",user:other}),res);
  assert.equal(res.code,200);assert.ok(saved);assert.equal(log.kind,"hiking");assert.equal(log.user.toString(),owner.toString());assert.deepEqual(filter,{_id:id,user:owner});
  for(const field of logFields.hiking)assert.equal(log[field.name],field.type==="number" ? 3 : body[field.name]);
 } finally {Model.findOne=original;}
});
test("invalid IDs fail before querying Mongo",async()=>{
 for(const handler of [controller.get,controller.update]){const req=request();req.params.id="invalid";const res=response();await handler(req,res);assert.equal(res.code,400);}
});
test("authentication middleware precedes every travel route",()=>{
 assert.equal(router.stack[0].handle.name,"protect");
 assert.deepEqual(router.stack.filter(layer=>layer.route).map(layer=>layer.route.path),["/","/:id"]);
});
