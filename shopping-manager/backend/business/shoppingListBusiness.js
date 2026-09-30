// /backend/business/shoppingListBusiness.js

import {Product,ShoppingList,ShoppingListItem,Store,Unit} from '../models/index.js';
import {calculateShoppingListEstimatedTotal} from './totalsBusiness.js';
import {requireStatusByTypeAndKey,validateStatusRef} from './statusBusiness.js';
import {resolveShoppingListStatus} from './statusFlowBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

export const recalculateShoppingListMeta=async(shoppingListId)=>{
 const items=await ShoppingListItem.find({shoppingList:shoppingListId});
 const estimatedTotal=calculateShoppingListEstimatedTotal(items);
 const nextStatusKey=resolveShoppingListStatus(items);
 const list=await ShoppingList.findById(shoppingListId);
 if(!list) throw new Error('Shopping list not found');
 const status=await requireStatusByTypeAndKey('shoppingListStatus',nextStatusKey);
 list.status=status._id;
 list.itemCount=items.length;
 list.estimatedTotal=estimatedTotal;
 await list.save();
 return list;
};

export const createShoppingListLogic=async(data={})=>{
 if(!data.user) throw new Error('User is required');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.status) await validateStatusRef({statusId:data.status,type:'shoppingListStatus'});
 else{
  const activeStatus=await requireStatusByTypeAndKey('shoppingListStatus','active');
  data.status=activeStatus._id;
 }
 return await ShoppingList.create(data);
};

export const addItemToShoppingListLogic=async(data={})=>{
 const list=await ensureExists(ShoppingList,data.shoppingList,'Shopping list not found');
 await ensureExists(Product,data.product,'Invalid product');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 if(data.priority) await validateStatusRef({statusId:data.priority,type:'priority'});
 const quantity=Number(data.quantity)||0;
 if(quantity<=0) throw new Error('Quantity must be greater than 0');
 let item=await ShoppingListItem.findOne({shoppingList:list._id,product:data.product,isPurchased:false});
 if(item){
  item.quantity=(Number(item.quantity)||0)+quantity;
  if(typeof data.estimatedPrice!=='undefined') item.estimatedPrice=data.estimatedPrice;
  if(data.notes) item.notes=data.notes;
  if(data.priority) item.priority=data.priority;
  if(data.store) item.store=data.store;
  if(data.unit) item.unit=data.unit;
  await item.save();
 }else{
  item=await ShoppingListItem.create({...data,user:list.user});
 }
 await recalculateShoppingListMeta(list._id);
 return await ShoppingListItem.findById(item._id).populate('product store unit priority');
};

export const updateShoppingListItemLogic=async(itemId,data={})=>{
 const item=await ShoppingListItem.findById(itemId);
 if(!item) throw new Error('Shopping list item not found');
 if(data.product) await ensureExists(Product,data.product,'Invalid product');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.unit) await ensureExists(Unit,data.unit,'Invalid unit');
 if(data.priority) await validateStatusRef({statusId:data.priority,type:'priority'});
 if(typeof data.quantity!=='undefined'&&(Number(data.quantity)||0)<=0) throw new Error('Quantity must be greater than 0');
 Object.assign(item,data);
 if(item.isPurchased&&!item.purchasedAt) item.purchasedAt=new Date();
 if(!item.isPurchased) item.purchasedAt=null;
 await item.save();
 await recalculateShoppingListMeta(item.shoppingList);
 return item;
};

export const markShoppingListItemPurchasedLogic=async(itemId,isPurchased=true)=>{
 const item=await ShoppingListItem.findById(itemId);
 if(!item) throw new Error('Shopping list item not found');
 item.isPurchased=!!isPurchased;
 item.purchasedAt=isPurchased?new Date():null;
 await item.save();
 await recalculateShoppingListMeta(item.shoppingList);
 return item;
};

export const removeShoppingListItemLogic=async(itemId)=>{
 const item=await ShoppingListItem.findById(itemId);
 if(!item) throw new Error('Shopping list item not found');
 const shoppingListId=item.shoppingList;
 await item.deleteOne();
 await recalculateShoppingListMeta(shoppingListId);
 return true;
};

export const getShoppingListWithItemsLogic=async(shoppingListId)=>{
 const list=await ShoppingList.findById(shoppingListId).populate('status store');
 if(!list) throw new Error('Shopping list not found');
 const items=await ShoppingListItem.find({shoppingList:shoppingListId}).populate('product store unit priority');
 return{list,items};
};

export default{
 recalculateShoppingListMeta,
 createShoppingListLogic,
 addItemToShoppingListLogic,
 updateShoppingListItemLogic,
 markShoppingListItemPurchasedLogic,
 removeShoppingListItemLogic,
 getShoppingListWithItemsLogic
};