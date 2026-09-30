import {useEffect,useState} from "react";
import {api,money} from "../../utils/api.js";

function TiersAdmin(){
 const [tiers,setTiers]=useState([]);const [knives,setKnives]=useState([]);const [selected,setSelected]=useState(null);const [message,setMessage]=useState("");
 const load=()=>Promise.all([api("/api/catalog/tiers"),api("/api/catalog/knife-types")]).then(([tiers,knives])=>{setTiers(tiers);setKnives(knives);}).catch(error=>setMessage(error.message));
 useEffect(()=>{
  Promise.all([api("/api/catalog/tiers"),api("/api/catalog/knife-types")])
   .then(([tierRecords,knifeRecords])=>{setTiers(tierRecords);setKnives(knifeRecords);})
   .catch(error=>setMessage(error.message));
 },[]);
 const quantityFor=id=>selected?.includedItems?.find(item=>(item.knifeTypeRef?._id||item.knifeTypeRef)===id)?.quantity||0;
 const setQuantity=(id,quantity)=>setSelected({...selected,includedItems:[...selected.includedItems.filter(item=>(item.knifeTypeRef?._id||item.knifeTypeRef)!==id),...(quantity>0?[{knifeTypeRef:id,quantity}]:[])]});
 const save=async event=>{event.preventDefault();try{const saved=await api(`/api/catalog/tiers/${selected._id}`,{method:"PUT",body:JSON.stringify({...selected,includedItems:selected.includedItems.map(item=>({knifeTypeRef:item.knifeTypeRef?._id||item.knifeTypeRef,quantity:item.quantity}))})});setSelected(saved);setMessage("Tier saved.");load();}catch(error){setMessage(error.message);}};
 return <section className="page-stack"><div className="page-heading"><p className="app-eyebrow">Admin Catalog</p><h2>Product Tiers</h2><p>Manage pricing, tier copy, included knives, and the integrated sharpener specification.</p></div><div className="tier-tabs">{tiers.map(tier=><button className={selected?._id===tier._id?"active":""} key={tier._id} onClick={()=>setSelected(tier)}>{tier.name}<small>{money(tier.basePrice)}</small></button>)}</div>
  {selected&&<form className="panel form-grid" onSubmit={save}><h3>{selected.name}</h3><label>Name<input value={selected.name} onChange={event=>setSelected({...selected,name:event.target.value})}/></label><label>Base price<input type="number" min="0" step="0.01" value={selected.basePrice} onChange={event=>setSelected({...selected,basePrice:Number(event.target.value)})}/></label><label className="full">Short description<input value={selected.shortDescription} onChange={event=>setSelected({...selected,shortDescription:event.target.value})}/></label><label>Sharpener mechanism<input value={selected.builtInSharpener?.mechanism||""} onChange={event=>setSelected({...selected,builtInSharpener:{...selected.builtInSharpener,mechanism:event.target.value}})}/></label><label>Sharpener abrasive<input value={selected.builtInSharpener?.abrasive||""} onChange={event=>setSelected({...selected,builtInSharpener:{...selected.builtInSharpener,abrasive:event.target.value}})}/></label><div className="full knife-picker"><h4>Included Knives</h4>{knives.map(knife=><label key={knife._id}><span><b>{knife.name}</b><small>{knife.category}</small></span><input type="number" min="0" value={quantityFor(knife._id)} onChange={event=>setQuantity(knife._id,Number(event.target.value))}/></label>)}</div><button className="button full">Save Tier</button></form>}{message&&<p className="status-banner">{message}</p>}</section>;
}

export default TiersAdmin;
