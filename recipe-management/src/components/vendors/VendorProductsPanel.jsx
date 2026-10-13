import {Link} from "react-router-dom";
import {useEffect,useMemo,useState} from "react";
import {Button,Form,Table} from "react-bootstrap";
import Alert from "../AppAlert.jsx";
import CostingVendorIngredientForm from "../../pages/forms/recipes/CostingVendorIngredientForm.jsx";

const id=value=>typeof value==="object"?value?._id||"":value||"";
const rows=data=>Array.isArray(data)?data:data?.data||data?.ingredients||data?.vendorIngredientPrices||[];
const request=async(url,body,method="POST")=>{
 const response=await fetch(url,body?{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:{});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||"Products could not load.");
 return data;
};
export function vendorProductRows(offers,ingredients,vendor,categories=[]){
 const records=new Map(ingredients.map(item=>[id(item),item]));
 return offers.filter(offer=>id(offer.vendor)===id(vendor)&&offer.isActive!==false).map(offer=>{
  const ingredient=records.get(id(offer.ingredient))||offer.ingredient;
  const category=categories.find(item=>id(item)===id(offer.vendorCategory))||categories.find(item=>id(item)===id(vendor.vendorCategory)||item.name===vendor.vendorCategory);
  return {...offer,ingredient,name:ingredient?.name||ingredient?.ingredientName||"Unnamed ingredient",categoryId:id(category)||"uncategorized",categoryName:category?.name||"Uncategorized"};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
export default function VendorProductsPanel({vendor}){
 const [offers,setOffers]=useState([]),[ingredients,setIngredients]=useState([]);
 const [category,setCategory]=useState(""),[query,setQuery]=useState("");
 const [editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [selectedProduct,setSelectedProduct]=useState("");
 const [vendorCategories,setVendorCategories]=useState([]);
 const [business,setBusiness]=useState(id(vendor.business_id)),[page,setPage]=useState(1);
 const loadOffers=async()=>setOffers(rows(await request(`/api/vendor-ingredient-prices?vendor=${encodeURIComponent(id(vendor))}&business=${encodeURIComponent(business)}`)));
 useEffect(()=>{
  let active=true;
  Promise.all([request(`/api/vendor-ingredient-prices?vendor=${encodeURIComponent(id(vendor))}`),request("/api/ingredients"),request("/api/app/current-business/recipe-management"),request("/api/vendor-categories")]).then(([products,records,current,categories])=>{
   if(!active)return;
   const currentId=id(current?.business||current?.data||current);setOffers(rows(products).filter(item=>id(item.business)===currentId));setIngredients(rows(records));setVendorCategories(Array.isArray(categories)?categories:categories?.data||categories?.vendorCategories||[]);setBusiness(currentId);
  }).catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));
  return()=>{active=false;};
 },[vendor._id]);
 const products=useMemo(()=>vendorProductRows(offers,ingredients,vendor,vendorCategories),[offers,ingredients,vendor,vendorCategories]);
 const categories=useMemo(()=>[...new Map(products.map(item=>[item.categoryId,{id:item.categoryId,name:item.categoryName}])).values()].sort((a,b)=>a.name.localeCompare(b.name)),[products]);
 const filtered=products.filter(item=>(!category||item.categoryId===category)&&(!query.trim()||[item.name,item.brand,item.sku,item.itemCode,item.packSizeName].some(value=>String(value||"").toLowerCase().includes(query.trim().toLowerCase()))));
 const pageCount=Math.max(1,Math.ceil(filtered.length/20));
 const save=async payload=>{
  setSaving(true);setError("");
  try{
   await request(payload._id?`/api/vendor-ingredient-prices/${payload._id}`:"/api/vendor-ingredient-prices",{...payload,vendor:id(vendor),business:payload.business||business},payload._id?"PUT":"POST");
   await Promise.all([loadOffers(),request("/api/ingredients").then(data=>setIngredients(rows(data)))]);
   setEditing(null);
  }catch(err){setError(err.message);throw err;}finally{setSaving(false);}
 };
 return <section className="vendors-col vendors-products">
  <div className="vendors-col-header d-flex align-items-center justify-content-between gap-2"><h3>Products ({products.length})</h3><Button size="sm" variant="outline-primary" disabled={loading||!business} onClick={()=>setEditing({})}>Add Product</Button></div>
  <div className="vendors-col-body">
   {error?<Alert variant="danger">{error}</Alert>:null}
   <div className="vendor-products-filters"><Form.Select aria-label="Product category" value={category} onChange={event=>{setCategory(event.target.value);setPage(1);}}><option value="">All categories</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select><Form.Control type="search" aria-label="Search vendor products" placeholder="Search products…" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}}/></div>
   {loading?<span>Loading products…</span>:<div className="vendor-products-table"><Table responsive size="sm"><thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Pack</th><th>Pack Cost</th><th/></tr></thead><tbody>{filtered.slice((Math.min(page,pageCount)-1)*20,Math.min(page,pageCount)*20).map(item=><tr key={item._id} tabIndex={0} aria-selected={selectedProduct===item._id} className={selectedProduct===item._id?"is-selected":""} onClick={()=>setSelectedProduct(item._id)} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==="Enter"||event.key===" ")){event.preventDefault();setSelectedProduct(item._id);}}}><td>{item.name}</td><td>{item.categoryName}</td><td>{item.brand||"—"}</td><td>{item.imperialDisplay||item.metricDisplay||item.packSizeName||"—"}</td><td>${Number(item.packCost||0).toFixed(2)}</td><td><div className="d-flex gap-2"><Button size="sm" variant="outline-primary" onClick={()=>setEditing(item)}>Edit</Button><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${id(vendor)}&product=${item._id}&new=1`}>Order</Button></div></td></tr>)}{!filtered.length?<tr><td colSpan={6}>No products found.</td></tr>:null}</tbody></Table></div>}
   {pageCount>1?<div className="d-flex justify-content-end align-items-center gap-2"><Button size="sm" variant="outline-primary" disabled={page<=1} onClick={()=>setPage(current=>current-1)}>Previous</Button><span>{Math.min(page,pageCount)} / {pageCount}</span><Button size="sm" variant="outline-primary" disabled={page>=pageCount} onClick={()=>setPage(current=>current+1)}>Next</Button></div>:null}
  </div>
  {editing?<CostingVendorIngredientForm vendor={vendor} business={business} row={editing._id?editing:null} ingredient={editing.ingredient} onClose={()=>!saving&&setEditing(null)} onSave={save} saving={saving}/>:null}
 </section>;
}
