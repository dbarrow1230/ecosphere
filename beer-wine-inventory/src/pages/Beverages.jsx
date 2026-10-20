import {Beer,Wine,Package,BadgeDollarSign,Warehouse,SlidersHorizontal,Search,X,Eye,Pencil} from "lucide-react";
import {isValidUpc} from "../utils/upc.js";
import "../styles/beverage-form.css";
import Barcode from "../components/Barcode.jsx";
import {useEffect,useRef,useState} from "react";
import {Link,useParams,useLocation,useNavigate} from "react-router-dom";
import {allRows,inventoryApi,referenceId,referenceLabel} from "../utils/inventoryApi.js";
import {loadCurrentBusiness} from "../utils/currentBusiness.js";

const textFields=["sku","name","displayName","barcode","beverageType","packageType","packageSize","notes"];
const numberFields=["sellingPrice","standardCost","lastCost","avgCost","reorderPoint","reorderQty","minLevel","maxLevel","parLevel","shelfLifeDays"];
const flags=["isAlcohol","requiresColdStorage","isBatchTracked","isActive"];
const references={business_id:["Business","businesses"],categoryRef:["Category","categories"],brandRef:["Brand","brands"],preferredVendorRef:["Preferred supplier","vendors"],uomRef:["Unit of measure","units-of-measure"]};
const fieldTitles={sku:"SKU",barcode:"UPC",displayName:"Display name",beverageType:"Beverage type",packageType:"Package type",packageSize:"Package size",sellingPrice:"Selling price",standardCost:"Standard cost",lastCost:"Last cost",avgCost:"Average cost",reorderPoint:"Reorder point",reorderQty:"Reorder quantity",minLevel:"Minimum level",maxLevel:"Maximum level",parLevel:"Par level",shelfLifeDays:"Shelf life (days)",isAlcohol:"Contains alcohol",requiresColdStorage:"Requires cold storage",isBatchTracked:"Track batches",isActive:"Active"};
const label=name=>fieldTitles[name]||name.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase());
const initial=type=>Object.fromEntries([...textFields.map(k=>[k,k==="beverageType"?type:""]),...numberFields.map(k=>[k,0]),...flags.map(k=>[k,k==="isActive"||k==="isAlcohol"&&["beer","wine"].includes(type)]),...Object.keys(references).map(k=>[k,""])]);

export default function Beverages({type=""}){
 const {id}=useParams(),location=useLocation(),navigate=useNavigate();
 const viewing=Boolean(id)&&!location.pathname.endsWith("/edit");
 const headingRef=useRef(null);
 useEffect(()=>{headingRef.current?.focus({preventScroll:true});},[location.pathname]);
 const editing=Boolean(id)||location.pathname.endsWith("/add");
 const [rows,setRows]=useState([]),[options,setOptions]=useState({}),[form,setForm]=useState(initial(type));
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [search,setSearch]=useState(""),[revision,setRevision]=useState(0);
 useEffect(()=>{
  let active=true;
  async function load(){
   setLoading(true);setError("");
   try{
    if(editing){
     const loaded=await Promise.all(Object.entries(references).map(async([key,[,endpoint]])=>[key,await allRows(`/api/${endpoint}`)]));
     let values=initial(type);
     if(id){
      const body=await inventoryApi(`/api/beverage-items/${id}`);
      values={...values,...body.data};
      for(const key of Object.keys(references)){
       const original=values[key];
       const choices=loaded.find(([name])=>name===key)[1];
       if(original&&typeof original==="object"&&(original.name||original.legalName||original.displayName||original.symbol)&&!choices.some(row=>referenceId(row)===referenceId(original)))choices.push(original);
       values[key]=referenceId(original);
      }
     }else{
      try{values.business_id=referenceId(await loadCurrentBusiness());}catch{/* The business remains an explicit required choice. */}
     }
     if(active){setOptions(Object.fromEntries(loaded));setForm(values);}
    }else{
     const business=await loadCurrentBusiness();
     const items=await allRows(`/api/beverage-items?business_id=${referenceId(business)}`);
     if(active)setRows(items);
    }
   }catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}
  }
  load();return()=>{active=false;};
 },[editing,id,type,revision]);
 async function save(event){
  event.preventDefault();if(viewing)return;setSaving(true);setError("");
  try{
   if(form.barcode&&!isValidUpc(form.barcode))throw new Error("Enter a valid 12-digit UPC, including its check digit.");
   if(Object.keys(references).some(key=>form[key]&&!options[key]?.some(row=>referenceId(row)===form[key])))throw new Error("Replace missing linked records with valid selections before saving.");
   const payload=Object.fromEntries([...textFields,...numberFields,...flags,...Object.keys(references)].map(key=>[key,form[key]]));
   for(const key of numberFields)payload[key]=Number(payload[key]);
   for(const key of Object.keys(references))payload[key]=referenceId(payload[key])||null;
   await inventoryApi(id?`/api/beverage-items/${id}`:"/api/beverage-items",{method:id?"PUT":"POST",body:JSON.stringify(payload)});
   navigate("/beverages");
  }catch(e){setError(e.message);}finally{setSaving(false);}
 }
 const change=(key,value)=>setForm(previous=>({...previous,[key]:value}));
 const field=key=>{
  const title=references[key]?.[0]||label(key);
  const missing=Boolean(references[key]&&form[key]&&!options[key]?.some(row=>referenceId(row)===form[key]));
  return <div className={`beverage-field beverage-field--${key}`} key={key}>
   {viewing?<span className="detail-label">{title}:</span>:<label htmlFor={`beverage-${key}`}>{title}:</label>}
   <div className="beverage-control">
    {viewing&&key==="barcode"?<Barcode value={form.barcode}/>:viewing?<span className="detail-value">{references[key]?referenceLabel(options[key]?.find(row=>referenceId(row)===form[key])):String(form[key]??"")||"—"}</span>:references[key]?<select id={`beverage-${key}`} name={key} className="form-select" required={["business_id","categoryRef","uomRef"].includes(key)} value={form[key]} aria-invalid={missing||undefined} onChange={e=>change(key,e.target.value)}>
     <option value="">Select {title.toLowerCase()}</option>
     {missing&&<option value={form[key]}>Select {title.toLowerCase()}</option>}
     {(options[key]||[]).map(row=><option value={referenceId(row)} key={referenceId(row)}>{referenceLabel(row)}{row.isActive===false?" (inactive)":""}</option>)}
    </select>:<input id={`beverage-${key}`} name={key} className="form-control" inputMode={key==="barcode"?"numeric":undefined} pattern={key==="barcode"?"[0-9]{12}":undefined} maxLength={key==="barcode"?12:undefined} aria-invalid={key==="barcode"&&Boolean(form.barcode)&&!isValidUpc(form.barcode)||undefined} type={numberFields.includes(key)?"number":"text"} min={numberFields.includes(key)?0:undefined} step={numberFields.includes(key)?"any":undefined} required={["name","sku","beverageType",...numberFields].includes(key)} value={form[key]??""} list={key==="beverageType"?"beverage-types":undefined} onChange={e=>change(key,e.target.value)}/>}
   </div>
  </div>;
 };
 const sectionIcons={"Beverage details":Beer,"Purchasing & pricing":BadgeDollarSign,"Stock levels":Warehouse};
 const BeverageIcon=form.beverageType?.toLowerCase()==="wine"?Wine:Beer;
 const group=(title,keys)=>{const Icon=sectionIcons[title];return <section className="beverage-section" aria-label={title}><h2 className="beverage-section-title"><Icon size={19} aria-hidden="true"/>{title}</h2><div className="beverage-fields">{keys.map(field)}</div></section>;};
 const visible=rows.filter(row=>(!type||row.beverageType?.toLowerCase()===type)&&`${row.name} ${row.sku} ${row.barcode}`.toLowerCase().includes(search.toLowerCase()));
 return <section className="app-page py-4">
  {editing?<header className="beverage-heading"><div className="beverage-emblem"><BeverageIcon size={34} strokeWidth={1.5} aria-hidden="true"/></div><div><p className="beverage-eyebrow">{viewing?"View beverage":id?"Edit beverage":"Add beverage"}</p><h1 ref={headingRef} tabIndex={-1}>{form.displayName||form.name||"New beverage"}</h1><div className="beverage-identity">{form.beverageType&&<span className="beverage-badge beverage-badge--type">{form.beverageType}</span>}{form.packageSize&&<span className="beverage-badge beverage-badge--size">{form.packageSize}</span>}{form.sku&&<span className="beverage-badge beverage-badge--sku">{form.sku}</span>}</div></div></header>:<h1>{type?label(type):"Beverage inventory"}</h1>}
  <div className={editing?"beverage-navigation":"d-flex gap-3 flex-wrap mb-3"}><Link to="/beverages">All beverages</Link><Link to="/categories">Categories</Link><Link to="/brands">Brands</Link><Link to="/units-of-measure">Units of measure</Link><Link to="/reports">Stock report</Link></div>
  {error&&<div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>setRevision(v=>v+1)}>Retry load</button></div>}
  {loading?<p role="status">Loading beverages…</p>:editing?<form className="beverage-form" onSubmit={save}>
   <fieldset className="beverage-editor" disabled={saving}>
    <div className="beverage-columns"><div className="beverage-main-column">
    {group("Beverage details",["name","displayName","sku","beverageType","categoryRef","brandRef"])}
    <section className="beverage-section" aria-label="Packaging & identification"><h2 className="beverage-section-title"><Package size={19} aria-hidden="true"/>Packaging & identification</h2>
     <div className="beverage-fields">{["packageType","packageSize","uomRef"].map(field)}</div>
     <div className="beverage-barcode">{field("barcode")}{!viewing&&<Barcode value={form.barcode}/>}</div>
    </section>
    {group("Purchasing & pricing",["business_id","preferredVendorRef","sellingPrice","standardCost","lastCost","avgCost"])}
    {group("Stock levels",["reorderPoint","reorderQty","minLevel","maxLevel","parLevel","shelfLifeDays"])}
    </div><div className="beverage-side-column">
    <section className="beverage-section" aria-label="Handling & availability"><h2 className="beverage-section-title"><SlidersHorizontal size={19} aria-hidden="true"/>Handling & availability</h2>
     <div className="beverage-checkboxes">{flags.map(key=>viewing?<div className="beverage-field" key={key}><span className="detail-label">{label(key)}:</span><span className="detail-value">{form[key]?"Yes":"No"}</span></div>:<label key={key} htmlFor={`beverage-${key}`}><input id={`beverage-${key}`} name={key} className="form-check-input" type="checkbox" checked={Boolean(form[key])} onChange={e=>change(key,e.target.checked)}/>{label(key)}</label>)}</div>
    </section>
    <section className="beverage-section beverage-notes"><h2 className="beverage-section-title">{viewing?"Notes":<label htmlFor="beverage-notes">Notes</label>}</h2>{viewing?<p className="detail-value detail-notes">{form.notes||"—"}</p>:<textarea id="beverage-notes" name="notes" className="form-control" rows={4} value={form.notes||""} onChange={e=>change("notes",e.target.value)}/>}</section>
    </div></div>
    <datalist id="beverage-types"><option value="beer"/><option value="wine"/><option value="spirits"/><option value="non-alcoholic"/></datalist>
    {!viewing&&<div className="beverage-actions"><button className="btn btn-primary" disabled={!options.business_id}>{saving?"Saving…":"Save beverage"}</button><Link to="/beverages" className="btn btn-secondary">Cancel</Link></div>}
   </fieldset>
  </form>:<>
   <Link className="btn btn-primary mb-3" to={type?`/${type}/add`:"/beverages/add"}>Add beverage</Link>
   <div className="inventory-search"><label htmlFor="beverage-search">Search beverages:</label><div className="inventory-search-control"><Search size={18} aria-hidden="true"/><input id="beverage-search" className="form-control" type="search" placeholder="Name, SKU or UPC" value={search} onChange={e=>setSearch(e.target.value)}/><button type="button" className="inventory-search-clear" onClick={()=>setSearch("")} disabled={!search} aria-label="Clear beverage search"><X size={18} aria-hidden="true"/></button></div></div>
   <div className="table-responsive"><table className="table"><thead><tr><th>Name</th><th>SKU</th><th>UPC</th><th>Type</th><th>Category</th><th>Unit</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(row=><tr key={row._id}><td>{row.displayName||row.name}</td><td>{row.sku}</td><td><Barcode value={row.barcode}/></td><td>{row.beverageType}</td><td>{referenceLabel(row.categoryRef)}</td><td>{referenceLabel(row.uomRef)}</td><td>{Number(row.sellingPrice||0).toFixed(2)}</td><td>{row.isActive?"Active":"Inactive"}</td><td><div className="beverage-row-actions"><Link to={`/beverages/${row._id}`}><Eye size={16} aria-hidden="true"/>View</Link><Link to={`/beverages/${row._id}/edit`}><Pencil size={16} aria-hidden="true"/>Edit</Link></div></td></tr>)}</tbody></table></div>
   {!error&&!visible.length&&<p>No beverages match. Add an item to begin.</p>}
  </>}
  {viewing&&!loading&&<div className="beverage-actions"><Link className="btn btn-primary" to={`/beverages/${id}/edit`}>Edit beverage</Link><Link className="btn btn-secondary" to="/beverages">Back to beverages</Link></div>}
 </section>;
}
