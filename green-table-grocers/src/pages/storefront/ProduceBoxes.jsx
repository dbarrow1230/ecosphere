import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {addBasketItem} from "../../utils/storefrontBasket.js";
import "../../styles/StorefrontPages.css";

const getRows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:[];
const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);

export default function ProduceBoxes(){
 const [boxes,setBoxes]=useState([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");

 useEffect(()=>{
  let ignore=false;
  Promise.all([
   fetch("/api/products").then(response=>response.ok?response.json():[]),
   fetch("/api/inventory").then(response=>response.ok?response.json():[])
  ]).then(([productData,inventoryData])=>{
   const inventory=getRows(inventoryData);
   const stockBySku=new Map(inventory.filter(item=>item?.sku).map(item=>[String(item.sku).toLowerCase(),item]));
   const stockByName=new Map(inventory.filter(item=>item?.name).map(item=>[String(item.name).toLowerCase(),item]));
   const rows=getRows(productData)
    .filter(item=>item?.status!=="inactive"&&`${item?.name||""} ${item?.category||""}`.toLowerCase().includes("box"))
    .map(product=>{
     const stock=stockBySku.get(String(product?.sku||"").toLowerCase())||stockByName.get(String(product?.name||"").toLowerCase());
     return {...product,availableQuantity:stock?Number(stock.quantity)||0:null};
    });
   if(!ignore)setBoxes(rows);
  }).finally(()=>{if(!ignore)setLoading(false);});
  return()=>{ignore=true;};
 },[]);

 return <div className="storefront-page">
  <header className="storefront-page-header centered"><div><p className="storefront-eyebrow">A surprise worth saving</p><h1>Rescued produce boxes</h1><p>Seasonal fruits and vegetables selected from the store’s current catalog and inventory.</p></div></header>
  {message&&<div className="storefront-status" role="status">{message} <Link to="/basket">View basket</Link></div>}
  {loading?<div className="storefront-status">Checking today’s produce boxes…</div>:boxes.length?(
   <section className="box-grid">{boxes.map((box,index)=><article className={`box-card${index===1?" featured":""}`} key={box._id||box.sku||box.name}>{index===1&&<span className="box-badge">Customer favorite</span>}<span className="box-icon">🥦</span><p className="product-category">{box.category||"Produce box"}</p><h2>{box.name}</h2><strong className="box-price">{money(box.price)}</strong><p>{box.availableQuantity===null?"Ask us about availability":box.availableQuantity>0?`${box.availableQuantity} available`:"Sold out today"}</p><button className="storefront-link-button" type="button" disabled={box.availableQuantity===0} onClick={()=>{addBasketItem(box);setMessage(`${box.name} was added to your basket.`);}}>Add this box</button></article>)}</section>
  ):<div className="storefront-status"><h2>No produce boxes are listed today</h2><p>Staff can add a product whose name or category contains “box,” and it will appear here automatically.</p><Link to="/shop" className="storefront-link-button">Shop individual groceries</Link></div>}
  <section className="storefront-note"><h2>What will be inside?</h2><p>Contents change with the harvest and available rescued inventory: twisty carrots, tiny apples, extra-ripe tomatoes, surplus greens, and other perfectly delicious surprises.</p></section>
 </div>;
}
