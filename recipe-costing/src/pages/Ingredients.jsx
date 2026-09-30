import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner,Table} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import VendorIngredientPriceForm from "./forms/admin/VendorIngredientPriceForm.jsx";
import GlobalIngredientForm from "./forms/recipes/GlobalIngredientForm.jsx";
import {ingredientDisplayName,ingredientIdentity,isUsableIngredientName} from "../utils/ingredientIdentity.js";
import "./Ingredients.css";

const label=value=>typeof value==="object"?(value?.legalName||value?.name||value?.title||"—"):(value||"—");
const idOf=value=>typeof value==="object"?(value?._id||""):(value||"");
const pageSize=50;
const packTextOf=price=>String(price.imperialDisplay||price.metricDisplay||price.packSizeName||"").trim();
const quantityOf=price=>{
 const explicit=price.imperialQuantity??price.metricQuantity;
 if(explicit!==null&&explicit!==undefined&&explicit!=="")return explicit;
 const match=packTextOf(price).match(/^\s*(\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)/);
 return match?.[1]||1;
};
const unitOf=price=>{
 const unit=price.imperialUnit||price.metricUnit;
 if(unit)return label(unit);
 const packText=packTextOf(price);
 return packText.replace(/^\s*(?:\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)\s*/,"")||"pack";
};
const numericQuantity=value=>{
 const text=String(value??"").trim();
 const mixed=text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
 if(mixed)return Number(mixed[1])+Number(mixed[2])/Number(mixed[3]);
 const fraction=text.match(/^(\d+)\/(\d+)$/);
 if(fraction)return Number(fraction[1])/Number(fraction[2]);
 return Number(text)||1;
};
const costPerUnitOf=price=>{
 const saved=Number(price.unitCost||0);
 if(saved>0)return saved;
 return Number(price.packCost||0)/numericQuantity(quantityOf(price));
};
const money4=value=>Number(value||0).toFixed(4);

export default function Ingredients(){
 const navigate=useNavigate();
 const [rows,setRows]=useState([]);
 const [vendorPrices,setVendorPrices]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [query,setQuery]=useState("");
 const [priceFilter,setPriceFilter]=useState("all");
 const [page,setPage]=useState(1);
 const [editing,setEditing]=useState(null);
 const [deleting,setDeleting]=useState(null);
 const [vendorPriceForm,setVendorPriceForm]=useState(null);

 const load=async()=>{
  const responses=await Promise.all([fetch("/api/ingredients"),fetch("/api/vendor-ingredient-prices?isActive=true")]);
  const data=await Promise.all(responses.map(response=>response.json().catch(()=>null)));
  if(!responses[0].ok)throw new Error(data[0]?.message||"Failed to load ingredients");
  if(!responses[1].ok)throw new Error(data[1]?.message||"Failed to load vendor prices");
  setRows((Array.isArray(data[0])?data[0]:[]).sort((left,right)=>String(left.name||left.ingredientName||"").localeCompare(String(right.name||right.ingredientName||""),undefined,{sensitivity:"base"})));
  setVendorPrices(Array.isArray(data[1])?data[1]:[]);
 };

 useEffect(()=>{
  let active=true;
  const task=Promise.resolve().then(load);
  task.catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));
  return()=>{active=false;};
 },[]);

 const pricesByIngredient=useMemo(()=>{
  const grouped=new Map();
  for(const price of vendorPrices){
   const ingredientId=idOf(price.ingredient);
   if(!ingredientId)continue;
   if(!grouped.has(ingredientId))grouped.set(ingredientId,[]);
   grouped.get(ingredientId).push(price);
  }
  return grouped;
 },[vendorPrices]);

 const groupedRows=useMemo(()=>{
  const groups=new Map();
  for(const row of rows){
   const identity=ingredientIdentity(row)||`record:${row._id}`;
   const existing=groups.get(identity);
   if(existing){
    existing.memberIds.push(row._id);
    existing.memberCount+=1;
    if(row.isCostingIngredient===true)existing.isCostingIngredient=true;
    if(!existing.description&&row.description)existing.description=row.description;
   }else{
    groups.set(identity,{...row,name:ingredientDisplayName(row)||row.name||row.ingredientName,memberIds:[row._id],memberCount:1,isUsable:isUsableIngredientName(row)});
   }
  }
  return [...groups.values()].sort((left,right)=>String(left.name||"").localeCompare(String(right.name||""),undefined,{sensitivity:"base"}));
 },[rows]);

 const visibleRows=useMemo(()=>{
  const search=query.trim().toLowerCase();
  return groupedRows.filter(row=>{
   const offers=row.memberIds.flatMap(memberId=>pricesByIngredient.get(memberId)||[]);
   const matchesSearch=!search||[row.name,row.ingredientName,row.description,label(row.category),...offers.map(price=>label(price.vendor))].some(value=>String(value||"").toLowerCase().includes(search));
   const matchesPrice=priceFilter==="all"||(priceFilter==="priced"?offers.length>0:offers.length===0);
   const belongsToCostingCatalog=row.isCostingIngredient===true||offers.length>0;
   return row.isUsable&&belongsToCostingCatalog&&matchesSearch&&matchesPrice;
  });
 },[groupedRows,query,priceFilter,pricesByIngredient]);
 const pricedCount=groupedRows.filter(row=>row.isUsable&&row.memberIds.some(memberId=>(pricesByIngredient.get(memberId)||[]).length>0)).length;
 const pageCount=Math.max(1,Math.ceil(visibleRows.length/pageSize));
 const pageRows=visibleRows.slice((page-1)*pageSize,page*pageSize);

 const openAdd=()=>{setEditing({});setError("");};
 const openEdit=row=>{setEditing(row);setError("");};
 const saveIngredient=async payload=>{
  try{
   setSaving(true);setError("");
   const isEdit=!!editing?._id;
   const response=await fetch(isEdit?`/api/ingredients/${editing._id}`:"/api/ingredients",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Failed to save ingredient");
   await load();setEditing(null);
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };

 const deleteIngredient=async()=>{
  if(!deleting)return;
  try{
   setSaving(true);setError("");
   const response=await fetch(`/api/ingredients/${deleting._id}`,{method:"DELETE"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Failed to delete ingredient");
   await load();setDeleting(null);
  }catch(err){setError(err.message);setDeleting(null);}finally{setSaving(false);}
 };

 const saveVendorPrice=async payload=>{
  try{
   setSaving(true);setError("");
   const isEdit=!!payload._id;
   const response=await fetch(isEdit?`/api/vendor-ingredient-prices/${payload._id}`:"/api/vendor-ingredient-prices",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Failed to save vendor price");
   await load();setVendorPriceForm(null);
  }catch(err){setError(err.message);throw err;}finally{setSaving(false);}
 };

 return(
  <main className="container-fluid px-3 px-xl-4 py-4">
   <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
    <div><h1 className="h3 mb-1">Ingredients</h1><p className="text-muted mb-0">Each ingredient can have prices from multiple vendors.</p></div>
    <div className="d-flex flex-wrap gap-2"><Button onClick={()=>navigate("/recipe-costings")}>Cost a Recipe</Button><Button variant="outline-primary" onClick={()=>navigate("/admin/vendor-ingredient-prices")}>Manage Vendor Prices</Button><Button variant="outline-primary" onClick={openAdd}>Add Ingredient</Button></div>
   </div>
   <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
    <Form.Control style={{maxWidth:"32rem"}} type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} placeholder="Search ingredients or vendors..."/>
    <div className="d-flex flex-wrap align-items-center gap-2">
     <Form.Select value={priceFilter} onChange={event=>{setPriceFilter(event.target.value);setPage(1);}} style={{width:"auto"}} aria-label="Filter ingredients by vendor pricing">
      <option value="all">All costing ingredients</option><option value="priced">Has vendor prices</option><option value="unpriced">Needs vendor price</option>
     </Form.Select>
     <span className="text-muted small">{visibleRows.length.toLocaleString()} shown · {pricedCount.toLocaleString()} priced</span>
    </div>
   </div>
   {error?<Alert variant="danger">{error}</Alert>:null}
   {loading?<div className="text-center py-4"><Spinner animation="border"/></div>:(
    <>
    <div><Table striped hover bordered align="middle" size="sm" className="ingredients-cost-table">
     <colgroup><col style={{width:"11%"}}/><col style={{width:"6%"}}/><col style={{width:"16%"}}/><col style={{width:"8%"}}/><col style={{width:"6%"}}/><col style={{width:"8%"}}/><col style={{width:"11%"}}/><col style={{width:"10%"}}/><col style={{width:"8%"}}/><col style={{width:"4%"}}/><col style={{width:"12%"}}/></colgroup>
     <thead><tr><th>Ingredient</th><th>Category</th><th>Description</th><th>Vendor</th><th>Purchase Qty</th><th>Unit / Package</th><th>Costing Conversion</th><th>Cost / Unit</th><th>Ingredient / Pack Cost</th><th>Active</th><th style={{width:"1%",whiteSpace:"nowrap"}}>Actions</th></tr></thead>
     <tbody>{pageRows.length===0?<tr><td colSpan="11" className="text-center text-muted">No matching ingredients found.</td></tr>:pageRows.map(row=>{
      const offers=row.memberIds.flatMap(memberId=>pricesByIngredient.get(memberId)||[]);
      const sortedOffers=[...offers].sort((left,right)=>label(left.vendor).localeCompare(label(right.vendor))||String(left.packSizeName||"").localeCompare(String(right.packSizeName||"")));
      const savedPrice=sortedOffers[0]||null;
      const offerCells=render=><div className="d-flex flex-column gap-2">{sortedOffers.map(render)}</div>;
      return <tr key={row._id}><td title={row.name||row.ingredientName}>{row.name||row.ingredientName||row.displayName||"Unnamed"}</td><td>{label(row.category||row.ingredientCategory)}</td><td title={row.description||""}>{row.description||"—"}</td><td>{sortedOffers.length?offerCells(price=><Button key={price._id} type="button" size="sm" variant="outline-secondary" onClick={()=>setVendorPriceForm({ingredient:row,row:price})}>{label(price.vendor)}</Button>):<span className="text-muted">No vendor</span>}</td><td>{sortedOffers.length?offerCells(price=><span key={price._id}>{quantityOf(price)}</span>):"—"}</td><td>{sortedOffers.length?offerCells(price=><span key={price._id}>{unitOf(price)}</span>):"—"}</td><td>{sortedOffers.length?offerCells(price=><span key={price._id}>1 pack = {quantityOf(price)} {unitOf(price)}</span>):"—"}</td><td>{sortedOffers.length?offerCells(price=><span key={price._id}>${money4(costPerUnitOf(price))} / {unitOf(price)}</span>):"—"}</td><td>{sortedOffers.length?offerCells(price=><span key={price._id}>${Number(price.packCost||0).toFixed(2)}</span>):"—"}</td><td>{row.isActive===false?"No":"Yes"}</td><td><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>openEdit(row)}>Edit</Button><Button size="sm" className="me-1" onClick={()=>setVendorPriceForm({ingredient:row,row:savedPrice})}>{savedPrice?"Open Price":"+ Price"}</Button><Button size="sm" variant="outline-danger" disabled={row.memberCount>1} title={row.memberCount>1?"Linked ingredient records must be consolidated at their source before deletion":""} onClick={()=>setDeleting(row)}>Delete</Button></td></tr>;
     })}</tbody>
    </Table></div>
    {pageCount>1?<div className="d-flex align-items-center justify-content-end gap-2"><Button size="sm" variant="outline-primary" disabled={page===1} onClick={()=>setPage(current=>Math.max(1,current-1))}>Previous</Button><span className="small">Page {page} of {pageCount}</span><Button size="sm" variant="outline-primary" disabled={page===pageCount} onClick={()=>setPage(current=>Math.min(pageCount,current+1))}>Next</Button></div>:null}
    </>
   )}

   <Modal show={editing!==null} onHide={()=>!saving&&setEditing(null)} centered>
    <Modal.Header closeButton><Modal.Title>{editing?._id?"Edit Global Ingredient":"Add Global Ingredient"}</Modal.Title></Modal.Header>
    <Modal.Body><GlobalIngredientForm key={editing?._id||"new"} initialData={editing||{}} onSubmit={saveIngredient} onCancel={()=>setEditing(null)} saving={saving}/></Modal.Body>
   </Modal>

   <Modal show={deleting!==null} onHide={()=>!saving&&setDeleting(null)} centered>
    <Modal.Header closeButton><Modal.Title>Delete Ingredient</Modal.Title></Modal.Header>
    <Modal.Body>Delete <strong>{deleting?.name||deleting?.ingredientName}</strong>? This cannot be undone.</Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setDeleting(null)} disabled={saving}>Cancel</Button><Button variant="danger" onClick={deleteIngredient} disabled={saving}>{saving?"Deleting...":"Delete Ingredient"}</Button></Modal.Footer>
   </Modal>

   {vendorPriceForm?<VendorIngredientPriceForm key={vendorPriceForm.row?._id||`new-${vendorPriceForm.ingredient._id}`} row={vendorPriceForm.row} ingredient={vendorPriceForm.ingredient} onClose={()=>setVendorPriceForm(null)} onSave={saveVendorPrice} saving={saving}/>:null}
  </main>
 );
}
