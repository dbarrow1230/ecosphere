import {useEffect,useState} from "react";

const getId=value=>value?._id||value?.id||value?.value||String(value||"");
const getText=value=>{
 if(value===undefined||value===null||value==="")return "-";
 if(typeof value==="object")return value.name||value.title||value.label||value.code||getId(value)||"-";
 return String(value);
};
const getRows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.items)?data.items:[];

export default function ResourceCrudPage({title,kicker,description,endpoint,columns=[],emptyText="No records found.",onOpen,openLabel="Open"}){
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const loadRows=async()=>{
  setLoading(true);
  setError("");
  try{
   const response=await fetch(endpoint,{headers:{Accept:"application/json"}});
   const data=await response.json().catch(()=>[]);
   if(!response.ok)throw new Error(data?.message||`Failed to load ${title}.`);
   setRows(getRows(data));
  }catch(loadError){
   setError(loadError.message||`Failed to load ${title}.`);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{loadRows();},[endpoint]);

 return <section className="domain-crud-page">
  <header className="domain-crud-hero">
   <div><p>{kicker}</p><h1>{title}</h1><p>{description}</p></div>
   <button type="button" onClick={loadRows} disabled={loading}>Refresh</button>
  </header>
  {error&&<p role="alert">{error}</p>}
  <div className="table-responsive">
   <table className="table">
    <thead><tr>{columns.map(column=><th key={column.key}>{column.label}</th>)}{onOpen&&<th>Action</th>}</tr></thead>
    <tbody>{rows.length?rows.map(row=><tr key={getId(row)}>
     {columns.map(column=><td key={column.key}>{getText(row[column.key])}</td>)}
     {onOpen&&<td><button type="button" onClick={()=>onOpen(row)}>{openLabel}</button></td>}
    </tr>):<tr><td colSpan={columns.length+(onOpen?1:0)}>{loading?"Loading...":emptyText}</td></tr>}</tbody>
   </table>
  </div>
 </section>;
}
