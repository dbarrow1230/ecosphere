import UpdateProductPrice from "./UpdateProductPrice.jsx";
import ProductPriceHistory from "./ProductPriceHistory.jsx";
import {categoryPath,categoryWithin} from "../../utils/vendorCategories.js";
import {Link} from "react-router-dom";
import {Fragment,useEffect,useMemo,useState} from "react";
import {Button,Form,Table,Modal} from "react-bootstrap";
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
  const category=categories.find(item=>id(item)===id(offer.productCategory));
  return {...offer,ingredient,name:ingredient?.name||ingredient?.ingredientName||"Unnamed ingredient",categoryId:id(category)||"uncategorized",categoryName:category?categoryPath(category,categories,offer.productCategoryPath):"Uncategorized"};
 }).sort((a,b)=>a.name.localeCompare(b.name));
}
export function groupVendorProducts(products,categories=[]){
 const groups=new Map();
 for(const product of products){let category=categories.find(item=>id(item)===id(product.productCategoryPath?.[0]||product.categoryId));const seen=new Set();while(!product.productCategoryPath?.length&&category?.parent&&!seen.has(id(category))){seen.add(id(category));const parent=categories.find(item=>id(item)===id(category.parent));if(!parent)break;category=parent;}const key=id(category)||"uncategorized";if(!groups.has(key))groups.set(key,{id:key,name:category?.name||"Uncategorized",items:[]});groups.get(key).items.push(product);}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export default function VendorProductsPanel({vendor}){
 const [offers,setOffers]=useState([]),[ingredients,setIngredients]=useState([]);
 const [category,setCategory]=useState(""),[query,setQuery]=useState("");
 const [editing,setEditing]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const [selectedProduct,setSelectedProduct]=useState("");
 const [vendorCategories,setVendorCategories]=useState([]);
 const [business,setBusiness]=useState(id(vendor.business_id));
 const [deleting,setDeleting]=useState(null),[removing,setRemoving]=useState(false),[deleteError,setDeleteError]=useState("");
 const removeProduct=async()=>{
  if(!deleting||removing)return;setRemoving(true);setDeleteError("");
  try{const response=await fetch(`/api/vendor-ingredient-prices/${id(deleting)}`,{method:"DELETE"});const result=await response.json().catch(()=>null);if(!response.ok)throw new Error(result?.message||"Product could not be deleted.");setOffers(current=>current.filter(item=>id(item)!==id(deleting)));if(selectedProduct===id(deleting))setSelectedProduct("");setDeleting(null);
  }catch(error){setDeleteError(error.message);}finally{setRemoving(false);}
 };
 const [historyProduct,setHistoryProduct]=useState(null);
 const [priceProduct,setPriceProduct]=useState(null);
 const openPriceHistory=async item=>{setError("");try{const fresh=await request(`/api/vendor-ingredient-prices/${id(item)}`);setOffers(current=>current.map(offer=>id(offer)===id(item)?fresh:offer));setHistoryProduct({...item,...fresh,name:item.name});}catch(error){setError(error.message);}};
 const loadOffers=async()=>setOffers(rows(await request(`/api/vendor-ingredient-prices?vendor=${encodeURIComponent(id(vendor))}&business=${encodeURIComponent(business)}`)));
 useEffect(()=>{
  let active=true;
  Promise.all([request(`/api/vendor-ingredient-prices?vendor=${encodeURIComponent(id(vendor))}`),request("/api/ingredients"),request("/api/app/current-business/recipe-management"),request("/api/product-categories")]).then(([products,records,current,categories])=>{
   if(!active)return;
   const currentId=id(current?.business||current?.data||current);setOffers(rows(products).filter(item=>id(item.business)===currentId));setIngredients(rows(records));setVendorCategories(Array.isArray(categories)?categories:categories?.data||categories?.productCategories||[]);setBusiness(currentId);
  }).catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));
  return()=>{active=false;};
 },[vendor._id]);
 const products=useMemo(()=>vendorProductRows(offers,ingredients,vendor,vendorCategories),[offers,ingredients,vendor,vendorCategories]);
 const categories=useMemo(()=>[{id:"uncategorized",name:"Uncategorized"},...vendorCategories.map(item=>({id:id(item),name:categoryPath(item,vendorCategories)}))].sort((a,b)=>a.name.localeCompare(b.name)),[vendorCategories]);
 const filtered=products.filter(item=>(!category||categoryWithin(item.categoryId,category,vendorCategories))&&(!query.trim()||[item.name,item.brand,item.sku,item.itemCode,item.packSizeName].some(value=>String(value||"").toLowerCase().includes(query.trim().toLowerCase()))));
 const [openGroups,setOpenGroups]=useState([]);
 const groupedProducts=groupVendorProducts(filtered,vendorCategories);
 const save=async payload=>{
  setSaving(true);setError("");
  try{
   await request(payload._id?`/api/vendor-ingredient-prices/${payload._id}`:"/api/vendor-ingredient-prices",{...payload,vendor:id(vendor),business:payload.business||business},payload._id?"PUT":"POST");
   const [updatedOffers,updatedIngredients,updatedCategories]=await Promise.all([request(`/api/vendor-ingredient-prices?vendor=${encodeURIComponent(id(vendor))}&business=${encodeURIComponent(business)}`),request("/api/ingredients"),request("/api/product-categories")]);
   setOffers(rows(updatedOffers));setIngredients(rows(updatedIngredients));setVendorCategories(Array.isArray(updatedCategories)?updatedCategories:updatedCategories?.data||updatedCategories?.productCategories||[]);
   setEditing(null);
  }finally{setSaving(false);}
 };
 return <section className="vendors-col vendors-products">
  <div className="vendors-col-header vendor-products-header"><h3>Products ({products.length})</h3>{vendor.vendorCategory?<h3 className="vendor-products-type"><small>Vendor Type</small>{typeof vendor.vendorCategory==="object"?vendor.vendorCategory.name:vendor.vendorCategory}</h3>:<span/>}<Button size="sm" variant="outline-primary" disabled={loading||!business} onClick={()=>setEditing({})}>Add Product</Button></div>
  <div className="vendors-col-body">
   {error?<Alert variant="danger">{error}</Alert>:null}
   <div className="vendor-products-filters"><Form.Select aria-label="Product category" value={category} onChange={event=>{setCategory(event.target.value);}}><option value="">All categories</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select><div className="vendor-products-search"><Form.Control type="search" aria-label="Search vendor products" placeholder="Search products…" value={query} onChange={event=>{setQuery(event.target.value);}}/>{query?<Button type="button" variant="outline-primary" aria-label="Clear product search" onClick={()=>setQuery("")}>Clear</Button>:null}</div></div>
   {loading?<span>Loading products…</span>:<div className="vendor-products-table vendor-grouped-table"><Table size="sm"><thead><tr><th>Product</th><th>Category</th><th>Brand</th><th>Pack</th><th>Pack Cost</th><th/></tr></thead><tbody>{groupedProducts.map(group=><Fragment key={group.id}><tr className="vendor-product-group-heading"><td colSpan={6}><button type="button" aria-expanded={openGroups.includes(group.id)} onClick={()=>setOpenGroups(current=>current.includes(group.id)?[]:[group.id])}><span aria-hidden="true">{openGroups.includes(group.id)?"▾":"▸"}</span>{group.name}<span>{group.items.length}</span></button></td></tr>{openGroups.includes(group.id)?<>{group.items.map(item=><tr key={item._id} tabIndex={0} aria-selected={selectedProduct===item._id} className={selectedProduct===item._id?"is-selected":""} onClick={event=>{if(!event.target.closest("button,a"))setSelectedProduct(item._id);}} onDoubleClick={event=>{if(!event.target.closest("button,a"))void openPriceHistory(item);}} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==="Enter"||event.key===" ")){event.preventDefault();setSelectedProduct(item._id);setHistoryProduct(item);}}}><td>{item.name}<small className="vendor-product-chart-hint">Double-click to view price chart</small></td><td>{item.categoryName}</td><td>{item.brand||"—"}</td><td>{item.imperialDisplay||item.metricDisplay||item.packSizeName||"—"}</td><td>${Number(item.packCost||0).toFixed(2)}</td><td><div className="d-flex gap-2"><Button size="sm" variant="outline-primary" onClick={()=>setEditing(item)}>Edit</Button><Button size="sm" variant="outline-primary" onClick={()=>setPriceProduct(item)}>Update Price</Button><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${id(vendor)}&product=${item._id}&new=1`}>Order</Button><Button size="sm" variant="outline-danger" onClick={()=>{setDeleteError("");setDeleting(item);}}>Delete</Button></div></td></tr>)}</>:null}</Fragment>)}{!filtered.length?<tr><td colSpan={6}>No products found.</td></tr>:null}</tbody></Table></div>}
  </div>
  {editing?<CostingVendorIngredientForm vendor={vendor} business={business} row={editing._id?editing:null} ingredient={editing.ingredient} onClose={()=>!saving&&setEditing(null)} onSave={save} saving={saving}/>:null}
  <Modal show={Boolean(deleting)} onHide={()=>!removing&&setDeleting(null)} centered><Modal.Header closeButton={!removing}><Modal.Title>Delete Product</Modal.Title></Modal.Header><Modal.Body>{deleteError?<Alert variant="danger">{deleteError}</Alert>:null}Delete <strong>{deleting?.name}</strong>{deleting?.brand?` (${deleting.brand})`:""} from {vendor.legalName||vendor.name}?</Modal.Body><Modal.Footer><Button variant="outline-primary" disabled={removing} onClick={()=>setDeleting(null)}>Cancel</Button><Button variant="danger" disabled={removing} onClick={removeProduct}>{removing?"Deleting…":"Delete Product"}</Button></Modal.Footer></Modal>
  {priceProduct?<UpdateProductPrice product={priceProduct} onClose={()=>setPriceProduct(null)} onSaved={updated=>setOffers(current=>current.map(item=>id(item)===id(updated)?updated:item))}/>:null}
  {historyProduct?<ProductPriceHistory product={historyProduct} onClose={()=>setHistoryProduct(null)}/>:null}
 </section>;
}
