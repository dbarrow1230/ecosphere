import Alert from "../../../components/AppAlert.jsx";
import {useEffect,useMemo,useState} from "react";
import {Badge,Button,Card,Col,Form,Row,Spinner,Table} from "react-bootstrap";
import {loadCurrentBusiness} from "../../../utils/currentBusiness.js";

const fields=["create","read","update","delete","admin"];
const emptyRow=(override=false)=>({_id:null,create:override?null:false,read:override?null:false,update:override?null:false,delete:override?null:false,admin:override?null:false});
const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value||"");

const api=async(url,options={})=>{
 const response=await fetch(url,{headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})},...options});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||data.error||`Request failed (${response.status})`);
 return data;
};

export default function PermissionMatrix({businessId="",embedded=false}){
 const [resolvedBusinessId,setResolvedBusinessId]=useState(businessId);
 const [scope,setScope]=useState("role");
 const [roles,setRoles]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [users,setUsers]=useState([]);
 const [modules,setModules]=useState([]);
 const [targetId,setTargetId]=useState("");
 const [matrix,setMatrix]=useState({});
 const [effective,setEffective]=useState({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [refreshKey,setRefreshKey]=useState(0);

 useEffect(()=>{
  let ignore=false;
  const resolve=async()=>{
   if(businessId){setResolvedBusinessId(String(businessId));return;}
   try{
    const business=await loadCurrentBusiness();
    if(!ignore)setResolvedBusinessId(getId(business));
   }catch(resolveError){if(!ignore)setError(resolveError.message||"Current business could not be loaded");}
  };
  resolve();
  return()=>{ignore=true;};
 },[businessId]);

 useEffect(()=>{
  if(!resolvedBusinessId)return;
  let ignore=false;
  const loadOptions=async()=>{
   setLoading(true);setError("");
   try{
    const query=encodeURIComponent(resolvedBusinessId);
    const [roleData,departmentData,userData,moduleData]=await Promise.all([
     api(`/api/users/roles?business=${query}&isActive=true`),
     api(`/api/users/business-departments?business=${query}&isActive=true`),
     api(`/api/users?business=${query}`),
     api(`/api/users/permission-modules?business=${query}&isActive=true`)
    ]);
    if(ignore)return;
    setRoles(Array.isArray(roleData.data)?roleData.data:[]);
    setDepartments(Array.isArray(departmentData.data)?departmentData.data:[]);
    setUsers(Array.isArray(userData.data)?userData.data:[]);
    setModules(Array.isArray(moduleData.data)?moduleData.data:[]);
   }catch(loadError){if(!ignore)setError(loadError.message);}
   finally{if(!ignore)setLoading(false);}
  };
  loadOptions();
  return()=>{ignore=true;};
 },[resolvedBusinessId]);

 const targets=scope==="role"?roles:scope==="department"?departments:users;

 useEffect(()=>{
  const firstId=getId(targets[0]);
  setTargetId(current=>targets.some(item=>getId(item)===current)?current:firstId);
 },[scope,targets]);

 useEffect(()=>{
  if(!resolvedBusinessId||!targetId||!modules.length){setMatrix({});setEffective({});return;}
  let ignore=false;
  const loadRows=async()=>{
   setLoading(true);setError("");setSuccess("");
   try{
    const business=encodeURIComponent(resolvedBusinessId);
    const target=encodeURIComponent(targetId);
    const endpoint=scope==="role"
     ?`/api/users/role-permissions?business=${business}&role=${target}`
     :scope==="department"
      ?`/api/users/department-permissions?business=${business}&department=${target}`
      :`/api/users/user-permission-overrides?business=${business}&user=${target}`;
    const rowsData=await api(endpoint);
    const rows=Array.isArray(rowsData.data)?rowsData.data:[];
    const next={};
    for(const module of modules){
     const key=module.key;
     const found=rows.find(row=>row.module===key);
     next[key]={...emptyRow(scope==="user"),...(found||{}),_id:found?(found._id||null):null};
    }
    let effectiveMap={};
    if(scope==="user"){
     const effectiveData=await api(`/api/users/effective-permissions?business=${business}&user=${target}`);
     effectiveMap=Object.fromEntries((effectiveData.data||[]).map(row=>[row.module,row]));
    }
    if(!ignore){setMatrix(next);setEffective(effectiveMap);}
   }catch(loadError){if(!ignore)setError(loadError.message);}
   finally{if(!ignore)setLoading(false);}
  };
  loadRows();
  return()=>{ignore=true;};
 },[resolvedBusinessId,targetId,scope,modules,refreshKey]);

 const groupedModules=useMemo(()=>{
  const groups={};
  for(const module of modules){const group=module.group||"Application";(groups[group]??=[]).push(module);}
  return Object.entries(groups).sort(([a],[b])=>a.localeCompare(b));
 },[modules]);

 const toggleBoolean=(moduleKey,field)=>{
  setMatrix(current=>{
   const row={...(current[moduleKey]||emptyRow())};
   row[field]=!row[field];
   if(field==="admin"&&row.admin)Object.assign(row,{create:true,read:true,update:true,delete:true});
   else if(field!=="admin")row.admin=!!(row.create&&row.read&&row.update&&row.delete);
   return {...current,[moduleKey]:row};
  });
 };

 const setOverride=(moduleKey,field,value)=>{
  const parsed=value===""?null:value==="allow";
  setMatrix(current=>({...current,[moduleKey]:{...(current[moduleKey]||emptyRow(true)),[field]:parsed}}));
 };

 const save=async()=>{
  if(!targetId)return;
  setSaving(true);setError("");setSuccess("");
  try{
   for(const module of modules){
    const key=module.key;
    const row=matrix[key]||emptyRow(scope==="user");
    const base=scope==="role"?"/api/users/role-permissions":scope==="department"?"/api/users/department-permissions":"/api/users/user-permission-overrides";
    const payload={business:resolvedBusinessId,module:key,...Object.fromEntries(fields.map(field=>[field,row[field]]))};
    if(scope==="role")payload.role=targetId;
    if(scope==="department")payload.department=targetId;
    if(scope==="user")payload.user=targetId;
    const hasValue=scope==="user"?fields.some(field=>row[field]!==null):fields.some(field=>row[field]===true);
    if(!hasValue&&row._id){await api(`${base}/${row._id}`,{method:"DELETE"});continue;}
    if(!hasValue)continue;
    await api(row._id?`${base}/${row._id}`:base,{method:row._id?"PUT":"POST",body:JSON.stringify(payload)});
   }
   setSuccess("Permissions saved. User overrides use Inherit, Allow, or Deny and take precedence over role and department defaults.");
   setRefreshKey(current=>current+1);
  }catch(saveError){setError(saveError.message);}
  finally{setSaving(false);}
 };

 const content=(
  <>
   {!embedded&&<div className="mb-4"><h1>Page Permissions</h1><p className="text-muted">Control page and action access by role, department, and individual user.</p></div>}
   {error&&<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>}{success&&<Alert variant="success">{success}</Alert>}
   <Card className="mb-3"><Card.Body><Row className="g-3 align-items-end">
    <Col md={4}><Form.Group><Form.Label>Permission level</Form.Label><Form.Select value={scope} onChange={event=>{setScope(event.target.value);setTargetId("");}}><option value="role">Role defaults</option><option value="department">Department defaults</option><option value="user">User overrides</option></Form.Select></Form.Group></Col>
    <Col md={5}><Form.Group><Form.Label>{scope==="role"?"Role":scope==="department"?"Department":"User"}</Form.Label><Form.Select value={targetId} onChange={event=>setTargetId(event.target.value)}><option value="">Select {scope}</option>{targets.map(target=><option key={getId(target)} value={getId(target)}>{target.name||target.username||target.email}</option>)}</Form.Select></Form.Group></Col>
    <Col md={3}><Button className="w-100" onClick={save} disabled={saving||!targetId}>{saving?"Saving...":"Save Permissions"}</Button></Col>
   </Row></Card.Body></Card>
   {scope==="user"&&<Alert variant="info">Inherit keeps the role/department result. Allow adds access. Deny removes inherited access.</Alert>}
   {loading?<div className="text-center py-5"><Spinner animation="border"/></div>:modules.length===0?<Alert variant="warning">No application pages are registered for this business.</Alert>:
    groupedModules.map(([group,items])=><Card className="mb-3" key={group}><Card.Header className="fw-bold">{group}</Card.Header><div className="table-responsive"><Table hover className="mb-0 align-middle"><thead><tr><th>Page</th><th>Path</th>{fields.map(field=><th key={field} className="text-capitalize text-center">{field}</th>)}{scope==="user"&&<th>Effective</th>}</tr></thead><tbody>{items.map(module=>{const row=matrix[module.key]||emptyRow(scope==="user");return <tr key={module.key}><td><strong>{module.label}</strong></td><td><code>{module.path||"—"}</code></td>{fields.map(field=><td key={field} className="text-center">{scope==="user"?<Form.Select size="sm" value={row[field]===null?"":row[field]?"allow":"deny"} onChange={event=>setOverride(module.key,field,event.target.value)}><option value="">Inherit</option><option value="allow">Allow</option><option value="deny">Deny</option></Form.Select>:<Form.Check className="d-inline-block" checked={!!row[field]} onChange={()=>toggleBoolean(module.key,field)}/>}</td>)}{scope==="user"&&<td>{effective[module.key]?.read||effective[module.key]?.admin?<Badge bg="success">Page allowed</Badge>:<Badge bg="secondary">Page denied</Badge>}</td>}</tr>;})}</tbody></Table></div></Card>)}
  </>
 );

 return embedded?<div>{content}</div>:<div className="container py-4">{content}</div>;
}
