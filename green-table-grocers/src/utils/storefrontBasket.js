const basketKey="green-table-grocers-basket";

export const getBasket=()=>{
 try{
  const value=JSON.parse(localStorage.getItem(basketKey)||"[]");
  return Array.isArray(value)?value:[];
 }catch{
  return [];
 }
};

export const saveBasket=items=>{
 localStorage.setItem(basketKey,JSON.stringify(items));
 window.dispatchEvent(new CustomEvent("GREEN_TABLE_BASKET_UPDATED",{detail:items}));
 return items;
};

export const addBasketItem=product=>{
 const items=getBasket();
 const productId=String(product?._id||product?.sku||product?.name||"");
 const existing=items.find(item=>item.productId===productId);

 if(existing){
  existing.quantity=Math.min(existing.quantity+1,Number(product.availableQuantity)||existing.quantity+1);
 }else{
  items.push({
   productId,
   name:product?.name||"Grocery item",
   sku:product?.sku||"",
   price:Number(product?.price)||0,
   quantity:1,
   availableQuantity:Number(product?.availableQuantity)||null
  });
 }

 return saveBasket(items);
};

export const clearBasket=()=>saveBasket([]);
