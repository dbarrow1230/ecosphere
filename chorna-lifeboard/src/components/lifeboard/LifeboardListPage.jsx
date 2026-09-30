// src/components/lifeboard/LifeboardListPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import "../../styles/LifeboardPage.css";

function LifeboardListPage({
 title,
 eyebrow="Chorna Lifeboard",
 text="View and manage your lifeboard records.",
 endpoint,
 dataKey,
 emptyText="No records found.",
 createPath="",
 createLabel="Add New",
 columns=[],
 filters=[]
}){

 const [items,setItems]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [filterValues,setFilterValues]=useState({});

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 useEffect(()=>{
  let ignore=false;

  const loadItems=async()=>{
   try{
    setLoading(true);
    setError("");

    const token=getToken();
    const res=await fetch(endpoint,{
     headers:{
      "Content-Type":"application/json",
      ...(token?{Authorization:`Bearer ${token}`}:{})
     }
    });

    const data=await res.json().catch(()=>({}));

    if(!res.ok)throw new Error(data.message||"Failed to load records");

    const records=Array.isArray(data)?data:Array.isArray(data?.[dataKey])?data[dataKey]:Array.isArray(data?.data)?data.data:Array.isArray(data?.items)?data.items:[];

    if(!ignore)setItems(records);
   }catch(err){
    if(!ignore)setError(err.message);
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadItems();

  return()=>{
   ignore=true;
  };
 },[endpoint,dataKey]);

 const getValue=(item,key)=>{
  if(!key)return "";
  const value=key.split(".").reduce((acc,part)=>acc?.[part],item);
  if(Array.isArray(value))return value.join(", ");
  if(value&&typeof value==="object")return value.name||value.title||value.label||value.value||"";
  return value??"";
 };

 const filteredItems=useMemo(()=>{
  return items.filter((item)=>{
   const searchMatch=!search.trim()||JSON.stringify(item).toLowerCase().includes(search.toLowerCase());

   const filtersMatch=filters.every((filter)=>{
    const selected=filterValues[filter.name];
    if(!selected||selected==="all")return true;
    return String(getValue(item,filter.field)).toLowerCase()===String(selected).toLowerCase();
   });

   return searchMatch&&filtersMatch;
  });
 },[items,search,filterValues,filters]);

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">{eyebrow}</p>
     <h1 className="lifeboard-page-title">{title}</h1>
     <p className="lifeboard-page-text">{text}</p>
    </div>

    {createPath&&(
     <Link to={createPath} className="lifeboard-page-action">{createLabel}</Link>
    )}
   </header>

   <section className="lifeboard-page-toolbar">
    <input
     type="search"
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     placeholder="Search records..."
     className="lifeboard-page-search"
    />

    {filters.map((filter)=>(
     <label key={filter.name} className="lifeboard-page-filter">
      <span>{filter.label}</span>
      <select
       value={filterValues[filter.name]||"all"}
       onChange={(e)=>setFilterValues(prev=>({...prev,[filter.name]:e.target.value}))}
      >
       <option value="all">All</option>
       {filter.options.map((option)=>(
        <option key={option.value} value={option.value}>{option.label}</option>
       ))}
      </select>
     </label>
    ))}
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading...</div>
    ):error?(
     <div className="lifeboard-page-error">{error}</div>
    ):filteredItems.length?(
     <div className="lifeboard-table-wrap">
      <table className="lifeboard-table">
       <thead>
        <tr>
         {columns.map((column)=>(
          <th key={column.key}>{column.label}</th>
         ))}
        </tr>
       </thead>

       <tbody>
        {filteredItems.map((item)=>(
         <tr key={item._id||item.id||item.title||item.name}>
          {columns.map((column)=>(
           <td key={column.key}>{column.render?column.render(item):getValue(item,column.key)||"-"}</td>
          ))}
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    ):(
     <div className="lifeboard-page-empty">{emptyText}</div>
    )}
   </section>

  </section>
 );
}

export default LifeboardListPage;