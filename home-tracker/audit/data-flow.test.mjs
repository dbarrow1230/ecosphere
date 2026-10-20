import test from 'node:test';
import assert from 'node:assert/strict';
import HomeItem from '../backend/models/home/homeItemModel.js';
import HomeCategory from '../backend/models/home/homeCategoryModel.js';
import HomeLocation from '../backend/models/home/homeLocationModel.js';
import Task from '../backend/models/tasks/taskModel.js';
import dashboard from '../backend/services/dashboard/getDashboardDataService.js';
import {getHomeItems,updateHomeItem} from '../backend/controllers/home/homeItemController.js';

const query=value=>({populate(){return this;},sort(){return this;},lean:async()=>value,then(resolve,reject){return Promise.resolve(value).then(resolve,reject);}});
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(data){this.data=data;return this;}});
const fail=error=>{throw error;};

test('dashboard uses stored records, preserves update fields and agrees with inventory attention rules',async t=>{
 const today=new Date();today.setUTCHours(0,0,0,0);
 const base={name:'Rice',quantity:1,minimumQuantity:2,parLevel:5,cost:3,storageType:'pantry',status:'active',unit:'bag',brand:'Original',barcode:'123',notes:'Keep dry',shoppingList:false,purchaseDate:today,createdAt:today};
 const records=[{...base,_id:'1',category:{_id:'cat',name:'Dry goods'},location:{_id:'loc',name:'Shelf'},expirationDate:today},
 {...base,_id:'2',name:'Soap',storageType:'household',quantity:0,status:'needed',category:null,location:null},
 {...base,_id:'3',name:'Used item',status:'used',expirationDate:today}];
 t.mock.method(HomeItem,'find',filter=>{assert.deepEqual(filter,{business:'business',location:'loc'});return query(records);});
 t.mock.method(HomeCategory,'find',()=>query([{name:'Dry goods'}]));
 t.mock.method(HomeLocation,'find',()=>query([{name:'Shelf'}]));
 t.mock.method(Task,'find',()=>query([{status:'Done'},{status:'Open'},{status:'Completed'}]));
 const data=await dashboard({business_id:'business',locationRef:'loc'});
 assert.equal(data.items.length,3);
 assert.equal(data.items[0].categoryId,'cat');assert.equal(data.items[0].locationId,'loc');
 for(const key of ['brand','barcode','notes','shoppingList','purchaseDate','cost','parLevel'])assert.deepEqual(data.items[0][key],base[key]);
 assert.deepEqual(data.lowStockItems.map(x=>x._id),['1','2']);
 assert.deepEqual(data.expiringItems.map(x=>x._id),['1']);
 assert.deepEqual(data.missingItems.map(x=>x._id),['2']);
 assert.equal(data.summary.completedTasks,2);assert.equal(data.summary.pendingTasks,1);
 assert.equal(data.categoryCosts[0].cost,3);assert.equal(data.categoryCosts[1].type,'household');
});

test('empty database yields a complete empty dashboard contract',async t=>{
 for(const model of [HomeItem,HomeCategory,HomeLocation,Task])t.mock.method(model,'find',()=>query([]));
 const data=await dashboard();assert.equal(data.stats.length,4);assert.ok(data.stats.every(x=>x.value===0));
 for(const key of ['items','lowStockItems','expiringItems','missingItems','categoryCosts'])assert.deepEqual(data[key],[]);
});

test('shopping list includes explicitly marked, needed and zero-quantity items',async t=>{
 let filter;t.mock.method(HomeItem,'find',value=>{filter=value;return query([]);});
 const res=response();await getHomeItems({query:{shoppingList:'true'}},res,fail);
 assert.deepEqual(filter.$or,[{shoppingList:true},{status:'needed'},{quantity:0}]);assert.deepEqual(res.data,{items:[]});
});

test('low stock and expiry filters retain an explicit status selection',async t=>{
 const filters=[];t.mock.method(HomeItem,'find',value=>{filters.push(value);return query([]);});
 await getHomeItems({query:{lowStock:'true',status:'needed'}},response(),fail);
 await getHomeItems({query:{expiringDays:'30',status:'expired'}},response(),fail);
 assert.equal(filters[0].status,'needed');assert.equal(filters[1].status,'expired');
 assert.equal(filters[1].expirationDate.$gte.getUTCHours(),0);
});

test('item updates preserve submitted form fields and do not erase omitted business ownership',async t=>{
 const body={name:'Rice',brand:'Brand',barcode:'123',storageType:'pantry',category:'cat',location:'loc',quantity:'4',minimumQuantity:'2',parLevel:'7',unit:'bag',cost:'3.5',purchaseDate:'2026-10-01',expirationDate:'2026-11-01',status:'active',shoppingList:true,notes:'Keep dry'};
 let saved;t.mock.method(HomeItem,'findByIdAndUpdate',(id,payload,opts)=>{saved=payload;assert.equal(opts.runValidators,true);return query({_id:id,...payload});});
 const res=response();await updateHomeItem({body,query:{},params:{id:'item'}},res,fail);
 for(const key of Object.keys(body))assert.equal(saved[key],['quantity','minimumQuantity','parLevel','cost'].includes(key)?Number(body[key]):body[key]);
 assert.equal(Object.hasOwn(saved,'business'),false);assert.equal(res.data.item._id,'item');
});
