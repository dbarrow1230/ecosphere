import {useEffect,useState} from "react";
import {Link,useParams,useLocation,useNavigate} from "react-router-dom";
import {allRows,inventoryApi,referenceId,referenceLabel} from "../utils/inventoryApi.js";
import {loadCurrentBusiness} from "../utils/currentBusiness.js";

const textFields=["sku","name","displayName","barcode","beverageType","packageType","packageSize","notes"];
const numberFields=["sellingPrice","standardCost","lastCost","avgCost","reorderPoint","reorderQty","minLevel","maxLevel","parLevel","shelfLifeDays"];
const flags=["isAlcohol","requiresColdStorage","isBatchTracked","isActive"];
const references={business_id:["Business","businesses"],categoryRef:["Category","categories"],brandRef:["Brand","brands"],preferredVendorRef:["Preferred supplier","vendors"],uomRef:["Unit of measure","units-of-measure"]};
const label=name=>name.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase());
const initial=type=>Object.fromEntries([...textFields.map(k=>[k,k==="beverageType"?type:""]),...numberFields.map(k=>[k,0]),...flags.map(k=>[k,k==="isActive"||k==="isAlcohol"&&["beer","wine"].includes(type)]),...Object.keys(references).map(k=>[k,""])]);

export default function Beverages({type=""}){
 const {id}=useParams(),location=useLocation(),navigate=useNavigate();
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
      for(const key of Object.keys(references))values[key]=referenceId(values[key]);
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
  event.preventDefault();setSaving(true);setError("");
  try{
   const payload=Object.fromEntries([...textFields,...numberFields,...flags,...Object.keys(references)].map(key=>[key,form[key]]));
   for(const key of numberFields)payload[key]=Number(payload[key]);
   for(const key of Object.keys(references))payload[key]=referenceId(payload[key])||null;
   await inventoryApi(id?`/api/beverage-items/${id}`:"/api/beverage-items",{method:id?"PUT":"POST",body:JSON.stringify(payload)});
   navigate("/beverages");
  }catch(e){setError(e.message);}finally{setSaving(false);}
 }
 const visible=rows.filter(row=>(!type||row.beverageType?.toLowerCase()===type)&&`${row.name} ${row.sku} ${row.barcode}`.toLowerCase().includes(search.toLowerCase()));
 return <section className="container py-4">
  <h1>{editing?(id?"Edit beverage":"Add beverage"):(type?label(type):"Beverage inventory")}</h1>
  <div className="d-flex gap-3 flex-wrap mb-3"><Link to="/beverages">All beverages</Link><Link to="/categories">Categories</Link><Link to="/brands">Brands</Link><Link to="/units-of-measure">Units of measure</Link><Link to="/reports">Stock report</Link></div>
  {error&&<div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>setRevision(v=>v+1)}>Retry load</button></div>}
  {loading?<p role="status">Loading beverages…</p>:editing?<form onSubmit={save}>
   <fieldset disabled={saving}>
    {Object.keys(references).some(key=>form[key]&&!options[key]?.some(row=>row._id===form[key]))&&<p className="alert alert-warning">This item has references that are missing from the available records. Select valid categories, units, or suppliers before saving. Existing data has not been changed.</p>}
    <div className="row g-3">
     {Object.entries(references).map(([key,[title]])=><label className="col-md-6" key={key}>{title}
      <select className="form-select" required={["business_id","categoryRef","uomRef"].includes(key)} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}>
       <option value="">Select {title.toLowerCase()}</option>
       {form[key]&&!options[key]?.some(row=>row._id===form[key])&&<option value={form[key]}>Existing reference ({form[key]})</option>}
       {(options[key]||[]).map(row=><option value={row._id} key={row._id}>{referenceLabel(row)}{row.isActive===false?" (inactive)":""}</option>)}
      </select></label>)}
     {textFields.map(key=><label className="col-md-6" key={key}>{label(key)}<input className="form-control" required={["name","sku","beverageType"].includes(key)} value={form[key]||""} list={key==="beverageType"?"beverage-types":undefined} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
     {numberFields.map(key=><label className="col-md-4" key={key}>{label(key)}<input className="form-control" type="number" min="0" step="any" required value={form[key]??0} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
     {flags.map(key=><label className="col-md-3" key={key}><input className="form-check-input me-2" type="checkbox" checked={Boolean(form[key])} onChange={e=>setForm({...form,[key]:e.target.checked})}/>{label(key)}</label>)}
    </div>
    <datalist id="beverage-types"><option value="beer"/><option value="wine"/><option value="spirits"/><option value="non-alcoholic"/></datalist>
    <button className="btn btn-primary mt-3" disabled={!options.business_id}>{saving?"Saving…":"Save beverage"}</button> <Link to="/beverages" className="btn btn-secondary mt-3">Cancel</Link>
   </fieldset>
  </form>:<>
   <Link className="btn btn-primary mb-3" to={type?`/${type}/add`:"/beverages/add"}>Add beverage</Link>
   <label className="d-block mb-3">Search name, SKU or barcode<input className="form-control" value={search} onChange={e=>setSearch(e.target.value)}/></label>
   <div className="table-responsive"><table className="table"><thead><tr><th>Name</th><th>SKU</th><th>Type</th><th>Category</th><th>Unit</th><th>Price</th><th>Status</th><th/></tr></thead><tbody>{visible.map(row=><tr key={row._id}><td>{row.displayName||row.name}</td><td>{row.sku}</td><td>{row.beverageType}</td><td>{referenceLabel(row.categoryRef)}</td><td>{referenceLabel(row.uomRef)}</td><td>{Number(row.sellingPrice||0).toFixed(2)}</td><td>{row.isActive?"Active":"Inactive"}</td><td><Link to={`/beverages/${row._id}/edit`}>View / edit all fields</Link></td></tr>)}</tbody></table></div>
   {!error&&!visible.length&&<p>No beverages match. Add an item to begin.</p>}
  </>}
 </section>;
}
