import assert from 'node:assert/strict';
import fs from 'node:fs';
import mongoose from 'mongoose';
import {calendarDate,localEventDate} from '../src/utils/calendarDate.js';

// Import actual route/controller/model chains without starting the app or Mongo scripts.
const connections=[];
mongoose.createConnection=()=>{
 const connection=new mongoose.Connection(mongoose);
 connections.push(connection);
 return connection;
};
const server=fs.readFileSync('backend/server.js','utf8');
let routeCount=0;
for(const match of server.matchAll(/import\s+\w+\s+from\s+"(\.\/routes\/[^" ]+)"/g)){
 const {default:router}=await import('../backend/'+match[1].slice(2));
 assert.equal(typeof router,'function');
 for(const layer of router.stack)if(layer.route)for(const handler of layer.route.stack)assert.equal(typeof handler.handle,'function');
 routeCount++;
}
assert.equal(calendarDate('2026-09-06T00:00:00.000Z'),'2026-09-06');
assert.equal(localEventDate('2026-09-06T00:00:00.000Z').getDate(),6);
assert.equal(calendarDate('invalid'),'');

const {default:Reminder}=await import('../backend/models/reminderModel.js');
const {default:router}=await import('../backend/routes/reminderRoutes.js');
const {createReminder,updateReminder,deleteReminder}=await import('../backend/controllers/reminderController.js');
for(const [method,path] of [['get','/'],['post','/'],['put','/:id'],['delete','/:id'],['post','/create-from-mentee'],['get','/mine']]){
 assert(router.stack.some(layer=>layer.route?.path===path&&layer.route.methods[method]),`${method} ${path}`);
}
const response=()=>({code:200,status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
const payload={user:new mongoose.Types.ObjectId().toString(),title:'Audit',message:'In-app fixture only',sendAt:'2099-01-01T12:00:00Z',status:'paused',channels:{inApp:true,email:false,sms:false},isRecurring:false};
let saved;
Reminder.create=async body=>{saved=new Reminder(body);await saved.validate();return saved;};
let res=response();await createReminder({body:payload},res);assert.equal(res.code,201);assert.equal(saved.nextRunAt.toISOString(),'2099-01-01T12:00:00.000Z');
saved.save=async()=>saved.validate();Reminder.findById=async()=>saved;
res=response();await updateReminder({params:{id:String(saved._id)},body:{title:'Changed'}},res);
assert.equal(res.code,200);assert.equal(saved.title,'Changed');assert.equal(saved.status,'paused');assert.equal(saved.channels.email,false);assert.equal(saved.sendAt.toISOString(),'2099-01-01T12:00:00.000Z');
res=response();await updateReminder({params:{id:String(saved._id)},body:{sendAt:'2099-02-01T12:00:00Z',nextRunAt:''}},res);
assert.equal(saved.nextRunAt.toISOString(),'2099-02-01-01T12:00:00.000Z'.replace('02-01-01','02-01'));
Reminder.findByIdAndDelete=async()=>null;
res=response();await deleteReminder({params:{id:'missing'}},res);assert.equal(res.code,404);
res=response();await createReminder({body:{...payload,sendAt:''}},res);assert.equal(res.code,400);

// Core forms must use fields that their Mongoose models persist.
const {default:CateringOrder}=await import('../backend/models/cateringOrderModel.js');
const {default:CateringContract}=await import('../backend/models/cateringContractModel.js');
const orderFixture=new CateringOrder({orderNumber:'AUDIT-ORDER',customerName:'Audit Client',orderDate:'2026-09-06',dietaryRequirements:['Vegan'],menuItems:[{item:'Soup',quantity:2,unitPrice:12.5}],orderTotal:25});
await orderFixture.validate();
assert.equal(orderFixture.menuItems[0].item,'Soup');
assert.equal(orderFixture.orderDate.toISOString().slice(0,10),'2026-09-06');
const contractFixture=new CateringContract({contractNumber:'AUDIT-CONTRACT',clientName:'Audit Client',clientAccepted:true,contractTotal:100,depositPaid:25,balance:75});
await contractFixture.validate();
assert.equal(contractFixture.balance,75);

for(const [page,model] of [['CateringOrderForm',CateringOrder],['CateringContractForm',CateringContract]]){
 const source=fs.readFileSync(`src/pages/forms/${page}.jsx`,'utf8');
 const names=[...source.matchAll(/name="([^"]+)"/g)].map(match=>match[1]);
 for(const field of new Set(names)){
  const modelField=page==="CateringOrderForm"&&["item","quantity","portion","unitPrice"].includes(field)?`menuItems.${field}`:field;
  assert(model.schema.path(modelField),`${page}.${field} is absent from its Mongo model`);
 }
}

for(const [page,modelName] of [['EventForm','Event'],['ClientForm','Client'],['InventoryItemForm','Inventory'],['MenuForm','Menu']]){
 const source=fs.readFileSync(`src/pages/forms/${page}.jsx`,'utf8');
 const fields=[...source.matchAll(/(?:field|area)\("([^"]+)"/g)].map(match=>match[1]);
 for(const field of new Set(fields))assert(mongoose.models[modelName].schema.path(field),`${page}.${field} is absent from its Mongo model`);
}

console.log(`PASS: ${routeCount} mounted router imports and handlers; every dedicated operations form field maps to its Mongo schema; reminder validation and controller round trips; calendar dates. No database writes, server startup, or build.`);
