import assert from 'node:assert/strict';
import fs from 'node:fs';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
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
const {default:businessConnection}=await import('../backend/db/businessInfoConnection.js');
for(const name of ['Ingredient','Equipment'])assert(businessConnection.models[name],`${name} registered for population`);
for(const name of ['Recipe','RecipeCosting','VendorIngredientPrice']){
 const model=businessConnection.models[name];
 assert(model,`${name} registered on business connection`);
 const refs=[];
 const collect=schema=>schema.eachPath((path,type)=>{if(typeof type.options?.ref==='string')refs.push(type.options.ref);if(type.schema)collect(type.schema);const element=type.caster||type.$embeddedSchemaType;if(typeof element?.options?.ref==='string')refs.push(element.options.ref);});
 collect(model.schema);
 for(const name of new Set(refs))assert(businessConnection.models[name],`${model.modelName} references unregistered ${name}`);
}

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
const {createDocumentController}=await import('../backend/controllers/cateringDocumentController.js');
const documentController=createDocumentController(CateringOrder,'Catering order');
let persistedOrder;
CateringOrder.create=async payload=>{persistedOrder=new CateringOrder(payload);await persistedOrder.validate();return persistedOrder;};
CateringOrder.find=()=>({sort:()=>({lean:async()=>[persistedOrder.toObject()]})});
CateringOrder.findById=()=>({lean:async()=>persistedOrder.toObject()});
CateringOrder.findByIdAndUpdate=async(id,payload,options)=>{assert.equal(options.runValidators,true);persistedOrder.set(payload);await persistedOrder.validate();return persistedOrder;};
res=response();await documentController.create({body:orderFixture.toObject()},res);assert.equal(res.code,201);
res=response();await documentController.list({},res);assert.equal(res.body.data[0].orderNumber,'AUDIT-ORDER');assert.equal(res.body.data[0].menuItems[0].item,'Soup');
res=response();await documentController.update({params:{id:String(persistedOrder._id)},body:{customerName:'Updated Client'}},res);assert.equal(res.code,200);
res=response();await documentController.get({params:{id:String(persistedOrder._id)}},res);assert.equal(res.body.data.customerName,'Updated Client');assert.equal(res.body.data.orderTotal,25);

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
 const fields=[...source.matchAll(/(?:field|area)\("([^"]+)"|name="([^"]+)"/g)].map(match=>match[1]||match[2]);
 for(const field of new Set(fields))assert(mongoose.models[modelName].schema.path(field),`${page}.${field} is absent from its Mongo model`);
}

// Exercise actual operations create/update controllers with schema-validating persistence doubles.
for(const [modelName,module,createName,updateName,key,fixture,patch] of [
 ['Client','clientController','createClient','updateClient','client',{name:'Audit Client',firstName:'Audit',lastName:'Client',email:'audit@example.invalid',phone:'555-0100',dietaryRequirements:'Vegan',billingEmail:'billing@example.invalid'},{allergies:'Sesame'}],
 ['Event','eventController','createEvent','updateEvent','event',{eventName:'Audit Event',clientName:'Audit Client',eventDate:'2026-09-06',eventTime:'12:30',guestCount:50,location:'Test Venue',loadingInstructions:'Side door',quotedTotal:1500},{staffingNotes:'Two servers'}],
 ['Inventory','inventoryController','createInventory','updateInventory','item',{name:'Audit Item',category:'Dry Goods',unit:'lb',quantityOnHand:10,lotTracking:true,storageZone:'Dry'},{committedQuantity:3}],
 ['Menu','menuController','createMenu','updateMenu','menu',{name:'Audit Menu',category:'Lunch',pricePerGuest:'25.50',minimumGuests:10,dietaryCoverage:'Vegan option'},{equipmentRequirements:'Chafers'}]
]){
 const Model=mongoose.models[modelName];
 const controller=await import(`../backend/controllers/${module}.js`);
 let stored;
 const query=value=>({populate(){return this;},then(resolve,reject){return Promise.resolve(value).then(resolve,reject);}});
 Model.create=async payload=>{stored=new Model(payload);await stored.validate();return stored;};
 Model.prototype.save=async function(){stored=this;await this.validate();return this;};
 Model.findById=()=>query(stored);
 Model.findByIdAndUpdate=async(id,payload,options)=>{
  assert.equal(options.runValidators,true);
  stored.set(payload);await stored.validate();return stored;
 };
 res=response();await controller[createName]({body:fixture},res);assert.equal(res.code,201,`${modelName} create: ${res.body?.message}`);
 for(const field of Object.keys(fixture))assert.notEqual(stored.get(field),undefined,`${modelName}.${field}`);
 res=response();await controller[updateName]({params:{id:String(stored._id)},body:patch},res);assert.equal(res.code,200,`${modelName} update`);
 assert(res.body[key]||res.body.data);
 for(const [field,value] of Object.entries(patch))assert.equal(stored.get(field),value);
}

// Verify reset-page URLs and token lifecycle using mocked persistence only.
const {default:User}=await import('../backend/models/users/userModel.js');
const {validateResetToken,resetPassword}=await import('../backend/controllers/users/authController.js');
const rawToken='audit-fixture-token';
const hashedToken=crypto.createHash('sha256').update(rawToken).digest('hex');
let lookup;
let resetUser=null;
User.findOne=query=>{lookup=query;return {select:async()=>resetUser};};
res=response();await validateResetToken({params:{token:rawToken}},res);
assert.equal(res.code,400);
assert.equal(lookup.resetPasswordToken,hashedToken);
assert(lookup.resetPasswordExpires.$gt instanceof Date);
resetUser={_id:'fixture',save:async()=>{}};
res=response();await validateResetToken({params:{token:rawToken}},res);assert.equal(res.code,200);
res=response();await resetPassword({params:{token:rawToken},body:{password:'audit-password'}},res);
assert.equal(res.code,200);assert.equal(resetUser.password,'audit-password');assert.equal(resetUser.resetPasswordToken,undefined);assert.equal(resetUser.resetPasswordExpires,undefined);
resetUser=null;
res=response();await resetPassword({params:{},body:{token:rawToken,password:'audit-password'}},res);assert.equal(res.code,400);assert.equal(lookup.resetPasswordToken,hashedToken);
const userRouter=(await import('../backend/routes/users/userRoutes.js')).default;
for(const method of ['get','post'])assert(userRouter.stack.some(layer=>layer.route?.path==='/reset-password/:token'&&layer.route.methods[method]));
for(const mount of ['permission-modules','departments','permissions']){
 assert(server.indexOf(`app.use("/api/users/${mount}"`)<server.indexOf('app.use("/api/users",'));
}
console.log(`PASS: ${routeCount} mounted router imports and handlers; every dedicated operations form field maps to its Mongo schema; reminder validation and controller round trips; calendar dates; reset token hashing, expiry query, invalid tokens, both reset URLs and token cleanup; permission mount order. No database writes, server startup, or build.`);
