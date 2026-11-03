import {useEffect,useMemo,useState} from "react";
import {api,money} from "../utils/api.js";

const emptyCustomer={firstName:"",lastName:"",email:"",phone:""};

function CustomBuilder(){
 const [knifeTypes,setKnifeTypes]=useState([]);
 const [customTier,setCustomTier]=useState(null);
 const [selected,setSelected]=useState({});
 const [customer,setCustomer]=useState(emptyCustomer);
 const [options,setOptions]=useState({bladeSteel:"",handleMaterial:"",finish:"",engraving:"",unitPrice:0,notes:""});
 const [message,setMessage]=useState("");

 useEffect(()=>{Promise.all([api("/api/catalog/knife-types"),api("/api/catalog/tiers")]).then(([knives,tiers])=>{setKnifeTypes(knives.filter(item=>item.isActive));setCustomTier(tiers.find(item=>item.code==="CUSTOM"));}).catch(error=>setMessage(error.message));},[]);
 const selectedKnives=useMemo(()=>Object.entries(selected).filter(([,quantity])=>quantity>0).map(([knifeTypeRef,quantity])=>({knifeTypeRef,quantity})),[selected]);

 const submit=async event=>{
  event.preventDefault();setMessage("");
  if(!customTier)return setMessage("The Custom tier is not configured.");
  if(!selectedKnives.length)return setMessage("Select at least one knife type.");
  try{
   const order=await api("/api/orders",{method:"POST",body:JSON.stringify({customer,tierRef:customTier._id,selectedKnives,...options,quantity:1,sharpenerConfiguration:customTier.builtInSharpener})});
   setMessage(`Custom order ${order.orderNumber} was created.`);setSelected({});setCustomer(emptyCustomer);
  }catch(error){setMessage(error.message);}
 };

 return <section className="page-stack"><div className="page-heading"><p className="app-eyebrow">Custom Collection</p><h2>Build a Pro Edge Set</h2><p>Select the knife types, materials, finish, and personalization. Every set retains the integrated sharpener.</p></div>
  <form className="builder-layout" onSubmit={submit}>
   <section className="panel"><h3>Knife Selection</h3><div className="knife-picker">{knifeTypes.map(item=><label key={item._id}><span><b>{item.name}</b><small>{item.category}</small></span><input type="number" min="0" value={selected[item._id]||0} onChange={event=>setSelected({...selected,[item._id]:Number(event.target.value)})}/></label>)}</div></section>
   <section className="panel form-grid"><h3>Customer and Set Options</h3>
    {Object.keys(emptyCustomer).map(key=><label key={key}>{key.replace(/([A-Z])/g," $1")}<input required={key!=="phone"} type={key==="email"?"email":"text"} value={customer[key]} onChange={event=>setCustomer({...customer,[key]:event.target.value})}/></label>)}
    <label>Blade steel<input value={options.bladeSteel} onChange={event=>setOptions({...options,bladeSteel:event.target.value})}/></label>
    <label>Handle material<input value={options.handleMaterial} onChange={event=>setOptions({...options,handleMaterial:event.target.value})}/></label>
    <label>Finish<input value={options.finish} onChange={event=>setOptions({...options,finish:event.target.value})}/></label>
    <label>Engraving<input value={options.engraving} onChange={event=>setOptions({...options,engraving:event.target.value})}/></label>
    <label>Quoted price<input type="number" min="0" step="0.01" value={options.unitPrice} onChange={event=>setOptions({...options,unitPrice:Number(event.target.value)})}/></label>
    <div className="sharpener-note full"><b>Integrated sharpener</b><span>{customTier?.builtInSharpener?.mechanism||"Configured in Admin"}</span><span>{customTier?.builtInSharpener?.abrasive}</span></div>
    <button className="button full" type="submit">Create Custom Order · {money(options.unitPrice)}</button>
   </section>
  </form>{message&&<p className="status-banner">{message}</p>}</section>;
}

export default CustomBuilder;
