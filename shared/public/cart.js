import {useEffect,useState} from "react";
const key=appKey=>`public-shop:${appKey}:basket`;
export function readCart(appKey){try{const rows=JSON.parse(localStorage.getItem(key(appKey))||"[]");return Array.isArray(rows)?rows.filter(row=>typeof row.productId==="string"&&Number.isInteger(row.quantity)&&row.quantity>0&&row.quantity<=99):[];}catch{return [];}}
export function saveCart(appKey,rows){try{localStorage.setItem(key(appKey),JSON.stringify(rows));}catch{/* A basket can still be used while this page is open. */}window.dispatchEvent(new CustomEvent("PUBLIC_BASKET_UPDATED",{detail:{appKey,rows}}));return rows;}
export function addToCart(appKey,product,configuration=""){
 const rows=readCart(appKey),existing=rows.find(row=>row.productId===product.id);
 if(existing){existing.quantity=Math.min(99,existing.quantity+1);if(configuration)existing.configuration=configuration;}
 else rows.push({productId:product.id,name:product.name,quantity:1,price:product.price,image:product.image,configuration});
 return saveCart(appKey,rows);
}
export function useCart(appKey){const [rows,setRows]=useState(()=>readCart(appKey));useEffect(()=>{const update=event=>{if(event.type==="storage")setRows(readCart(appKey));else if(event.detail?.appKey===appKey)setRows(event.detail.rows);};window.addEventListener("storage",update);window.addEventListener("PUBLIC_BASKET_UPDATED",update);return()=>{window.removeEventListener("storage",update);window.removeEventListener("PUBLIC_BASKET_UPDATED",update);};},[appKey]);return rows;}
