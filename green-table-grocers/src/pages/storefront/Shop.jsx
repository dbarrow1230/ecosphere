import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {addBasketItem,getBasket} from "../../utils/storefrontBasket.js";
import "../../styles/StorefrontPages.css";

const getRows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.products)?data.products:[];
const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);

export default function Shop(){
 const [products,setProducts]=useState([]);
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [basketCount,setBasketCount]=useState(()=>getBasket().reduce((total,item)=>total+item.quantity,0));

 useEffect(()=>{
  let ignore=false;
  Promise.all([
   fetch("/api/products").then(response=>response.ok?response.json():Promise.reject(new Error("Products unavailable"))),
   fetch("/api/inventory").then(response=>response.ok?response.json():[])
  ])
   .then(([productData,inventoryData])=>{
    const inventory=getRows(inventoryData);
    const stockBySku=new Map(inventory.filter(item=>item?.sku).map(item=>[String(item.sku).toLowerCase(),item]));
    const stockByName=new Map(inventory.filter(item=>item?.name).map(item=>[String(item.name).toLowerCase(),item]));
    const rows=getRows(productData).filter(item=>item?.status!=="inactive").map(product=>{
     const stock=stockBySku.get(String(product?.sku||"").toLowerCase())||stockByName.get(String(product?.name||"").toLowerCase());
     return {...product,availableQuantity:stock?Number(stock.quantity)||0:null,stockStatus:stock?.status||""};
    });
    if(!ignore)setProducts(rows);
   })
   .catch(()=>{if(!ignore)setProducts([]);})
   .finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 const visibleProducts=useMemo(()=>{
  const term=query.trim().toLowerCase();
  if(!term)return products;
  return products.filter(item=>`${item?.name||""} ${item?.category||""}`.toLowerCase().includes(term));
 },[products,query]);

 return <div className="storefront-page">
  <header className="storefront-page-header">
   <div><p className="storefront-eyebrow">Today’s rescued selection</p><h1>Shop good food</h1><p>Fresh, flavorful groceries with unique shapes, surplus stories, and prices that make sense.</p></div>
   <Link to="/basket" className="basket-pill" aria-live="polite">Basket · {basketCount}</Link>
  </header>
  <div className="shop-toolbar"><label htmlFor="shop-search">Find a grocery</label><input id="shop-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search produce and pantry goods"/></div>
  {loading?<div className="storefront-status">Gathering today’s fresh finds…</div>:visibleProducts.length?(
   <section className="product-grid" aria-label="Available groceries">
    {visibleProducts.map((product,index)=><article className="product-card" key={product?._id||product?.sku||index}>
     <div className="product-card-art" aria-hidden="true">{product?.category?.toLowerCase().includes("fruit")?"🍎":product?.category?.toLowerCase().includes("pantry")?"🥫":"🥬"}</div>
     <div className="product-card-body"><p className="product-category">{product?.category||"Fresh find"}</p><h2>{product?.name||"Rescued grocery"}</h2><p className={`stock-label${product.availableQuantity===0?" sold-out":""}`}>{product.availableQuantity===null?"Ask us about today’s availability":product.availableQuantity>0?`${product.availableQuantity} in stock`:"Sold out today"}</p><div className="product-card-footer"><strong>{money(product?.price)}</strong><button type="button" disabled={product.availableQuantity===0} onClick={()=>{const items=addBasketItem(product);setBasketCount(items.reduce((total,item)=>total+item.quantity,0));}}>Add to basket</button></div></div>
    </article>)}
   </section>
  ):<div className="storefront-status"><h2>Fresh finds are being stocked</h2><p>Check back soon or visit us in Brooklyn for today’s rescued selection.</p></div>}
 </div>;
}
