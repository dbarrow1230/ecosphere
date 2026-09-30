import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {api,money} from "../utils/api.js";

function Tiers(){
 const [tiers,setTiers]=useState([]);
 const [error,setError]=useState("");
 useEffect(()=>{api("/api/catalog/tiers").then(setTiers).catch(error=>setError(error.message));},[]);

 return <section className="page-stack">
  <div className="page-heading"><p className="app-eyebrow">Collection Levels</p><h2>Choose a Pro Edge Set</h2><p>Basic, Pro, and Pro Max are fixed collections. Custom lets the customer build a set.</p></div>
  {error&&<p className="error-banner">{error}</p>}
  <div className="tier-grid">{tiers.map(tier=><article className={`tier-card tier-${tier.code.toLowerCase()}`} key={tier._id}>
   <div><span>Level {tier.level}</span><h3>{tier.name}</h3><p>{tier.shortDescription}</p></div>
   <strong className="tier-price">{money(tier.basePrice)}</strong>
   <div className="sharpener-note"><b>Built-in sharpener</b><span>{tier.builtInSharpener?.mechanism}</span><span>{tier.builtInSharpener?.abrasive}</span></div>
   <ul>{tier.includedItems?.map(item=><li key={item.knifeTypeRef?._id||item.knifeTypeRef}>{item.quantity} × {item.knifeTypeRef?.name||"Knife type"}</li>)}</ul>
   {tier.allowCustomization?<Link className="button" to="/custom-builder">Build This Set</Link>:<Link className="button" to={`/orders?tier=${tier._id}`}>Start Order</Link>}
  </article>)}</div>
 </section>;
}

export default Tiers;
