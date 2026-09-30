import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {clearBasket,getBasket,saveBasket} from "../../utils/storefrontBasket.js";
import "../../styles/StorefrontPages.css";

const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);

export default function Basket(){
 const [items,setItems]=useState(()=>getBasket());
 const [customer,setCustomer]=useState({name:"",email:"",phone:"",pickup:""});
 const [status,setStatus]=useState("");
 const [saving,setSaving]=useState(false);
 const total=useMemo(()=>items.reduce((sum,item)=>sum+(item.price*item.quantity),0),[items]);

 const updateQuantity=(productId,quantity)=>{
  const next=items.map(item=>item.productId===productId?{...item,quantity:Math.max(0,Math.min(Number(quantity)||0,item.availableQuantity||99))}:item).filter(item=>item.quantity>0);
  setItems(saveBasket(next));
 };

 const submitOrder=async event=>{
  event.preventDefault();
  if(!items.length)return;
  setSaving(true);setStatus("");
  const itemSummary=items.map(item=>`${item.quantity} × ${item.name}${item.sku?` (${item.sku})`:""}`).join("; ");
  try{
   const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:`Web order - ${customer.name}`,quantity:items.reduce((sum,item)=>sum+item.quantity,0),price:Number(total.toFixed(2)),status:"pending",notes:`Email: ${customer.email}\nPhone: ${customer.phone||"Not provided"}\nPickup: ${customer.pickup||"Next available"}\nItems: ${itemSummary}`})});
   if(!response.ok)throw new Error("Order could not be submitted");
   clearBasket();setItems([]);setStatus("Thank you! Your order was sent to Green Table Grocers for confirmation.");
  }catch(error){setStatus(error.message||"Order could not be submitted");}finally{setSaving(false);}
 };

 return <div className="storefront-page">
  <header className="storefront-page-header"><div><p className="storefront-eyebrow">Almost at your table</p><h1>Your basket</h1><p>Review your rescued groceries and send your pickup order to the store.</p></div></header>
  {status&&<div className="storefront-status" role="status">{status}</div>}
  {!items.length?<div className="storefront-status"><h2>Your basket is ready for a fresh find</h2><Link className="storefront-link-button" to="/shop">Shop groceries</Link></div>:
  <div className="basket-layout"><section className="basket-items">{items.map(item=><article key={item.productId}><div><h2>{item.name}</h2><p>{item.sku||"Rescued grocery"} · {money(item.price)} each</p></div><label>Quantity<input type="number" min="0" max={item.availableQuantity||99} value={item.quantity} onChange={event=>updateQuantity(item.productId,event.target.value)}/></label><strong>{money(item.price*item.quantity)}</strong></article>)}<div className="basket-total"><span>Total</span><strong>{money(total)}</strong></div></section>
  <form className="checkout-form" onSubmit={submitOrder}><h2>Pickup details</h2><label>Name<input required value={customer.name} onChange={event=>setCustomer({...customer,name:event.target.value})}/></label><label>Email<input required type="email" value={customer.email} onChange={event=>setCustomer({...customer,email:event.target.value})}/></label><label>Phone<input type="tel" value={customer.phone} onChange={event=>setCustomer({...customer,phone:event.target.value})}/></label><label>Preferred pickup time<input type="text" placeholder="Saturday morning" value={customer.pickup} onChange={event=>setCustomer({...customer,pickup:event.target.value})}/></label><button type="submit" disabled={saving}>{saving?"Sending order…":"Send pickup order"}</button></form></div>}
 </div>;
}
