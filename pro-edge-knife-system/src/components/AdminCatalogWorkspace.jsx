import {useMemo,useState} from "react";
import {Button,Form} from "react-bootstrap";
import "../styles/AdminCatalogWorkspace.css";

function AdminCatalogWorkspace({title,description,records,selectedId,onSelect,onAdd,addLabel,loading,emptyMessage,searchPlaceholder,getId,getName,getCode,getDescription,isActive,actions,children}){
 const [search,setSearch]=useState("");
 const [status,setStatus]=useState("all");

 const filtered=useMemo(()=>{
  const term=search.trim().toLowerCase();
  return records.filter(record=>{
   const active=isActive(record);
   if(status==="active"&&!active)return false;
   if(status==="inactive"&&active)return false;
   if(!term)return true;
   return [getName(record),getCode(record),getDescription(record)]
    .some(value=>String(value||"").toLowerCase().includes(term));
  });
 },[records,search,status,getName,getCode,getDescription,isActive]);

 return(
  <section className="admin-catalog-page">
   <header className="admin-catalog-header">
    <div><p>Administration catalog</p><h1>{title}</h1><span>{description}</span></div>
    <Button onClick={onAdd}>{addLabel||`Add ${title.replace(/s$/i,"")}`}</Button>
   </header>

   <div className="admin-catalog-toolbar">
    <Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder={searchPlaceholder||`Search ${title.toLowerCase()}...`} aria-label={`Search ${title}`}/>
    <Form.Select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Filter by status">
     <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
    </Form.Select>
    <span>{filtered.length} of {records.length}</span>
   </div>

   <div className="admin-catalog-shell">
    <aside className="admin-catalog-index" aria-label={`${title} list`}>
     {filtered.map(record=>(
      <button type="button" className={`admin-catalog-item${selectedId===getId(record)?" is-selected":""}`} key={getId(record)} onClick={()=>onSelect(getId(record))}>
       <span>{getName(record)||"Untitled"}</span><strong>{getCode(record)||"NO-CODE"}</strong>
       <span className={`admin-catalog-status-badge ${isActive(record)?"is-active":"is-inactive"}`}>{isActive(record)?"Active":"Inactive"}</span>
      </button>
     ))}
     {loading?<p className="admin-catalog-empty">Loading...</p>:null}
     {!loading&&!filtered.length?<p className="admin-catalog-empty">{emptyMessage||"No matching records."}</p>:null}
    </aside>
    <article className="admin-catalog-detail">
     <header><div>{children}</div><div className="admin-catalog-actions">{actions}</div></header>
    </article>
   </div>
  </section>
 );
}

export default AdminCatalogWorkspace;
