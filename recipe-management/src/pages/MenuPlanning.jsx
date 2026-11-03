import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import MenuPurchasingWorkspace from "@shared/culinary/MenuPurchasingWorkspace.jsx";
import Alert from "../components/AppAlert.jsx";

export default function MenuPlanning(){
 const [business,setBusiness]=useState(""),[options,setOptions]=useState(null),[error,setError]=useState("");const navigate=useNavigate();
 const api=async(path,body,method="POST")=>{
  const response=await fetch(`/api/culinary${path}${path.includes("?")?"&":"?"}business=${encodeURIComponent(business)}`,body?{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,business})}:{});
  const data=await response.json();if(!response.ok)throw new Error(data.message||"Menu planning could not load.");return data;
 };
 const refresh=async()=>setOptions(await api("/options"));
 useEffect(()=>{fetch("/api/app/current-business/recipe-management").then(response=>response.json()).then(data=>{const record=data?.business||data?.data||data;setBusiness(record._id);}).catch(err=>setError(err.message));},[]);
 useEffect(()=>{if(business)refresh().catch(err=>setError(err.message));},[business]);
 const createOrder=plan=>{
  try{const key=crypto.randomUUID();sessionStorage.setItem(`recipe-management-order-plan:${key}`,JSON.stringify({...plan,business}));navigate(`/purchasing?plan=${encodeURIComponent(key)}&new=1`);}catch(err){setError(err.message);}
 };
 return <main className="purchasing-page"><header className="purchasing-header"><h1>Menu Planning</h1><Link className="btn btn-outline-primary" to="/menus">Menus</Link></header>{error?<Alert variant="danger">{error}</Alert>:null}{options?<MenuPurchasingWorkspace api={api} options={options} refresh={refresh} onCreateOrder={createOrder}/>:<p>Loading menus…</p>}</main>;
}
