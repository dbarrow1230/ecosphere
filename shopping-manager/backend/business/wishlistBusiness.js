// /backend/business/wishlistBusiness.js

import {Product,ShoppingList,Store,Wishlist} from '../models/index.js';
import {addItemToShoppingListLogic} from './shoppingListBusiness.js';
import {requireStatusByTypeAndKey,validateStatusRef} from './statusBusiness.js';

const ensureExists=async(Model,id,message)=>{
 const doc=await Model.findById(id);
 if(!doc) throw new Error(message);
 return doc;
};

export const createWishlistItemLogic=async(data={})=>{
 data.name=String(data.name||'').trim();
 if(!data.name) throw new Error('Wishlist item name is required');
 if(data.product) await ensureExists(Product,data.product,'Invalid product');
 if(data.store) await ensureExists(Store,data.store,'Invalid store');
 if(data.priority) await validateStatusRef({statusId:data.priority,type:'priority'});
 if(data.status) await validateStatusRef({statusId:data.status,type:'wishlistStatus'});
 else data.status=(await requireStatusByTypeAndKey('wishlistStatus','active'))._id;
 return await Wishlist.create(data);
};

export const moveWishlistItemToShoppingListLogic=async({wishlistItemId,shoppingListId,quantity=1}={})=>{
 const item=await Wishlist.findById(wishlistItemId);
 if(!item) throw new Error('Wishlist item not found');
 const shoppingList=await ShoppingList.findById(shoppingListId);
 if(!shoppingList) throw new Error('Shopping list not found');
 const created=await addItemToShoppingListLogic({
  shoppingList:shoppingList._id,
  product:item.product,
  store:item.store||null,
  quantity,
  estimatedPrice:item.currentPrice||item.targetPrice||0
 });
 const purchasedStatus=await requireStatusByTypeAndKey('wishlistStatus','moved');
 item.status=purchasedStatus._id;
 await item.save();
 return created;
};

export default{
 createWishlistItemLogic,
 moveWishlistItemToShoppingListLogic
};
