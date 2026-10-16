import {useEffect,useMemo,useState} from "react";
import {Button,Form,Modal} from "react-bootstrap";
import Alert from "../../../components/AppAlert.jsx";
import IngredientForm from "./IngredientForm.jsx";
import VendorForm from "../admin/VendorForm.jsx";
import SortedSelect from "../../../components/SortedSelect.jsx";

const id=value=>typeof value==="object"?value?._id||"":value||"";
const rows=data=>Array.isArray(data)?data:data?.data||data?.vendors||data?.ingredients||data?.businesses||[];
const request=async(url,body,method="POST")=>{
 const response=await fetch(url,body?{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:{});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
};

export default function CostingVendorIngredientForm({row,business,ingredient,vendor:fixedVendor,onClose,onSave,saving=false}){
 const [vendorId,setVendorId]=useState(id(fixedVendor)||id(row?.vendor));
 const [options,setOptions]=useState({vendors:[],ingredients:[],businesses:[],imperialUnits:[],metricUnits:[],categories:[]});
 const [error,setError]=useState("");
 const [newVendor,setNewVendor]=useState(null);
 const [savingVendor,setSavingVendor]=useState(false);
 const [savingIngredient,setSavingIngredient]=useState(false);
 const busy=saving||savingVendor||savingIngredient;
 useEffect(()=>{
  let active=true;
  Promise.all(["vendors","ingredients","businesses","imperial-units","metric-units","product-categories"].map(name=>request(`/api/${name}`))).then(data=>{
   if(active)setOptions({vendors:rows(data[0]),ingredients:rows(data[1]),businesses:rows(data[2]),imperialUnits:rows(data[3]),metricUnits:rows(data[4]),categories:Array.isArray(data[5])?data[5]:data[5]?.productCategories||data[5]?.data||[]});
  }).catch(err=>active&&setError(err.message));
  return()=>{active=false;};
 },[]);
 const vendor=useMemo(()=>{
  const found=fixedVendor||options.vendors.find(item=>id(item)===vendorId);
  return found?{...found,business_id:found.business_id||business}:null;
 },[options.vendors,vendorId,business,fixedVendor]);
 const initialData=useMemo(()=>({...row,ingredient:row?.ingredient||ingredient||""}),[row,ingredient]);
 const saveVendor=async payload=>{
  if(busy)return;
  setSavingVendor(true);setError("");
  try{
   const data=await request("/api/vendors",payload);
   const saved=data?.data||data?.vendor||data;
   if(!id(saved))throw new Error("The saved vendor could not be loaded.");
   setOptions(previous=>({...previous,vendors:[...previous.vendors.filter(item=>id(item)!==id(saved)),saved]}));
   setVendorId(id(saved));setNewVendor(null);
  }catch(err){setError(err.message);}finally{setSavingVendor(false);}
 };
 const save=async payload=>{
  if(busy)return;
  setSavingIngredient(true);setError("");
  try{
   const ingredientRecord={name:payload.name,description:payload.description,unit:payload.defaultUnit,notes:payload.ingredientNotes};
   let ingredientId=payload.ingredient;
   const data=await request(ingredientId?`/api/ingredients/${ingredientId}`:"/api/ingredients",ingredientRecord,ingredientId?"PUT":"POST");
   if(!ingredientId)ingredientId=id(data?.ingredient||data?.data||data);
   if(!ingredientId)throw new Error("The saved ingredient could not be loaded.");
   const {name,description,defaultUnit,ingredientNotes,category,...offer}=payload;
   await onSave({...offer,ingredient:ingredientId,business:id(business)||payload.business});
  }catch(err){setError(err.message);}finally{setSavingIngredient(false);}
 };
 return <>
  <Modal show={!newVendor} onHide={()=>!busy&&onClose()} size="xl" centered scrollable>
   <Modal.Header closeButton><Modal.Title>{row?._id?"Edit":"Add"} Vendor Ingredient</Modal.Title></Modal.Header>
   <Modal.Body>
    {error?<Alert variant="danger">{error}</Alert>:null}
    {!fixedVendor?<Form.Group className="costing-vendor-selector mb-3"><Form.Label>Vendor</Form.Label><div className="d-flex align-items-center gap-2">
     <SortedSelect name="vendor" value={vendorId} onChange={event=>setVendorId(event.target.value)} disabled={busy||Boolean(row?._id)} options={options.vendors.filter(item=>item.isActive!==false||id(item)===vendorId)} getValue={id} getLabel={item=>item.legalName||item.name} placeholder="Select vendor"/>
     <Button type="button" variant="outline-primary" className="text-nowrap flex-shrink-0" disabled={busy} onClick={()=>{setError("");setNewVendor({business_id:id(business),supportsIngredients:true,isActive:true});}}>Add Vendor</Button>
    </div></Form.Group>:null}
    {vendor?<IngredientForm initialData={initialData} vendor={vendor} ingredients={options.ingredients} imperialUnits={options.imperialUnits} metricUnits={options.metricUnits} categories={options.categories} onSubmit={save} onCancel={onClose} loading={busy}/>:null}
   </Modal.Body>
  </Modal>
  <Modal show={Boolean(newVendor)} onHide={()=>!busy&&setNewVendor(null)} size="xl" centered scrollable>
   <Modal.Header closeButton><Modal.Title>Add Vendor</Modal.Title></Modal.Header>
   <Modal.Body>{error?<Alert variant="danger">{error}</Alert>:null}{newVendor?<VendorForm initialData={newVendor} businesses={options.businesses} onSubmit={saveVendor} onCancel={()=>setNewVendor(null)} fixedBusiness={{_id:id(business),legalName:"Recipe Management"}} loading={savingVendor}/>:null}</Modal.Body>
  </Modal>
 </>;
}
