// frontend/src/pages/admin/BusinessRolesPermissionsPage.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Row,Spinner,Table,Tabs,Tab} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Save,Shield,Trash2,UserCog,Building2} from "lucide-react";
import {useSearchParams} from "react-router-dom";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import PermissionMatrix from "./users/PermissionMatrix.jsx";

const emptyRoleForm={name:"",business:"",description:"",isDefault:false,isActive:true};
const emptyDepartmentForm={name:"",code:"",accountingCode:"",business:"",description:"",defaultRole:"",isDefault:false,isActive:true};
const emptyNewModuleForm={module:"",create:false,read:true,update:false,delete:false,admin:false};

export default function BusinessRolesPermissionsPage(){
 const [searchParams,setSearchParams]=useSearchParams();
 const [businesses,setBusinesses]=useState([]);
 const [selectedBusiness,setSelectedBusiness]=useState("");
 const [roles,setRoles]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [permissions,setPermissions]=useState([]);
 const [moduleOptions,setModuleOptions]=useState([]);
 const [loadingBusinesses,setLoadingBusinesses]=useState(false);
 const [loadingRoles,setLoadingRoles]=useState(false);
 const [loadingDepartments,setLoadingDepartments]=useState(false);
 const [,setLoadingPermissions]=useState(false);
 const [,setLoadingModules]=useState(false);
 const [savingRole,setSavingRole]=useState(false);
 const [savingDepartment,setSavingDepartment]=useState(false);
 const [savingPermissionById,setSavingPermissionById]=useState({});
 const [,setSavingNewPermission]=useState(false);
 const [roleForm,setRoleForm]=useState(emptyRoleForm);
 const [departmentForm,setDepartmentForm]=useState(emptyDepartmentForm);
 const [editingRoleId,setEditingRoleId]=useState("");
 const [editingDepartmentId,setEditingDepartmentId]=useState("");
 const [activeTab,setActiveTab]=useState("roles");
 const [message,setMessage]=useState({type:"",text:""});
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loadingBusinessTypes,setLoadingBusinessTypes]=useState(false);
 const [currentAppBusinessId,setCurrentAppBusinessId]=useState("");
 const [loadingCurrentBusiness,setLoadingCurrentBusiness]=useState(false);
 const [selectedPermissionRole,setSelectedPermissionRole]=useState("");
 const [newModuleForm,setNewModuleForm]=useState(emptyNewModuleForm);
 const roleFormRef=useRef(null);
 const roleNameRef=useRef(null);
 const departmentFormRef=useRef(null);
 const departmentNameRef=useRef(null);

 const api=async(url,options={})=>{
  const finalUrl=url.includes("?")?`${url}&_=${Date.now()}`:`${url}?_=${Date.now()}`;

  const res=await fetch(finalUrl,{
   cache:"no-store",
   headers:{
    "Cache-Control":"no-cache",
    "Pragma":"no-cache",
    ...(options.body?{"Content-Type":"application/json"}:{}),
    ...(options.headers||{})
   },
   ...options
  });

  const data=await res.json().catch(()=>null);

  if(!res.ok)
   throw new Error(data?.message||data?.error||JSON.stringify(data)||`Request failed (${res.status})`);

  return data;
 };

 const getId=value=>getObjectId(value);

 const getBusinessTypeName=typeRef=>{
  if(typeRef?.name)return typeRef.name;

  const typeId=typeof typeRef==="object"?getId(typeRef):typeRef;
  const match=businessTypes.find(type=>String(getId(type))===String(typeId));

  return match?.name||"";
 };

 const getBusinessLabel=business=>{
  const typeName=getBusinessTypeName(business?.typeRef);
  return `${business?.legalName||business?.code||"Unnamed Business"}${typeName?` (${typeName})`:""}`;
 };

 const getRoleLabel=role=>{
  const name=String(role?.name||"").trim();
  const status=role?.isActive===false?"Inactive":"Active";
  const defaultText=role?.isDefault?"Default":"Custom";

  return `${name}${name?` (${defaultText}, ${status})`:""}`;
 };

 const getDepartmentLabel=department=>{
  const name=String(department?.name||"").trim();
  const code=String(department?.code||"").trim();
  const accountingCode=String(department?.accountingCode||"").trim();
  const status=department?.isActive===false?"Inactive":"Active";
  const defaultText=department?.isDefault?"Default":"Custom";

  return `${name}${code?` [${code}]`:""}${accountingCode?` ${accountingCode}`:""}${name?` (${defaultText}, ${status})`:""}`;
 };

 const normalizeModuleOption=item=>{
  if(typeof item==="string")
  {
   return{
    value:item,
    label:item
     .replace(/_/g," ")
     .replace(/-/g," ")
     .replace(/\b\w/g,char=>char.toUpperCase())
   };
  }

  return{
   value:String(item?.key||item?.value||item?.module||""),
   label:String(item?.label||item?.name||item?.key||item?.value||item?.module||"")
  };
 };

 const toModuleLabel=value=>{
  return String(value||"")
   .trim()
   .replace(/[_-]+/g," ")
   .replace(/\s+/g," ")
   .replace(/\b\w/g,char=>char.toUpperCase());
 };

 const normalizedModuleOptions=useMemo(()=>{
  return moduleOptions
   .map(normalizeModuleOption)
   .filter(module=>module.value);
 },[moduleOptions]);

 const moduleSelectOptions=useMemo(()=>{
  const map=new Map();

  normalizedModuleOptions.forEach(module=>{
   map.set(module.value,{value:module.value,label:module.label||toModuleLabel(module.value)});
  });

  permissions.forEach(permission=>{
   const value=String(permission?.module||"").trim().toLowerCase();
   if(value&&!map.has(value))
   {
    map.set(value,{value,label:toModuleLabel(value)});
   }
  });

  return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label));
 },[normalizedModuleOptions,permissions]);

 const roleOptions=useMemo(()=>{
  return [...roles].sort((a,b)=>{
   if(a.isDefault!==b.isDefault)return a.isDefault?-1:1;
   return String(a.name||"").localeCompare(String(b.name||""));
  });
 },[roles]);

 const departmentOptions=useMemo(()=>{
  return [...departments].sort((a,b)=>{
   if(a.isDefault!==b.isDefault)return a.isDefault?-1:1;
   return String(a.name||"").localeCompare(String(b.name||""));
  });
 },[departments]);

 const selectedRolePermissions=useMemo(()=>{
  if(!selectedPermissionRole)return [];
  return permissions
   .filter(permission=>String(getId(permission.role))===String(selectedPermissionRole))
   .sort((a,b)=>(a.module||"").localeCompare(b.module||""));
 },[permissions,selectedPermissionRole]);

 const _availableModuleOptions=useMemo(()=>{
  const usedModules=new Set(selectedRolePermissions.map(permission=>String(permission.module||"").trim().toLowerCase()));
  return moduleSelectOptions.filter(module=>!usedModules.has(module.value));
 },[moduleSelectOptions,selectedRolePermissions]);

 useEffect(()=>{
  const init=async()=>{
   const requestedBusinessId=getId(searchParams.get("business"));
   const requestedTab=String(searchParams.get("tab")||"").trim().toLowerCase();

   if(["roles","departments","permissions"].includes(requestedTab))
   {
    setActiveTab(requestedTab);
   }

   const businessId=requestedBusinessId||await loadCurrentAppBusiness();
   if(requestedBusinessId)setSelectedBusiness(requestedBusinessId);
   fetchBusinesses(businessId);
   fetchBusinessTypes();
  };

  init();
 },[]);

 useEffect(()=>{
  if(!selectedBusiness)
  {
   setRoles([]);
   setDepartments([]);
   setPermissions([]);
   setModuleOptions([]);
   setRoleForm(prev=>({...prev,business:""}));
   setDepartmentForm(prev=>({...prev,business:""}));
   setSelectedPermissionRole("");
   return;
  }

  const businessId=String(selectedBusiness);

  setMessage({type:"",text:""});
  setRoleForm(prev=>({...prev,business:businessId}));
  setDepartmentForm(prev=>({...prev,business:businessId}));
  fetchRoles(businessId);
  fetchDepartments(businessId);
  fetchPermissions(businessId);
  fetchModules(businessId);
 },[selectedBusiness]);

 useEffect(()=>{
  if(!selectedBusiness)
  {
   setSelectedPermissionRole("");
   return;
  }

  if(!selectedPermissionRole&&roleOptions.length>0)
  {
   setSelectedPermissionRole(String(getId(roleOptions[0])));
   return;
  }

  if(selectedPermissionRole&&!roleOptions.some(role=>String(getId(role))===String(selectedPermissionRole)))
  {
   setSelectedPermissionRole(roleOptions.length?String(getId(roleOptions[0])):"");
  }
 },[roleOptions,selectedBusiness,selectedPermissionRole]);

 const loadCurrentAppBusiness=async()=>{
  try{
   setLoadingCurrentBusiness(true);
   const business=await loadCurrentBusiness();
   const businessId=getId(business);
   setCurrentAppBusinessId(businessId);
   if(businessId)setSelectedBusiness(businessId);
   return businessId;
  }catch{
   setCurrentAppBusinessId("");
   setSelectedBusiness("");
   return "";
  }finally{
   setLoadingCurrentBusiness(false);
  }
 };

 const fetchBusinesses=async(preferredBusinessId=currentAppBusinessId)=>{
  try{
   setLoadingBusinesses(true);
   setMessage({type:"",text:""});
   const res=await api("/api/businesses");
   const list=Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[];
   setBusinesses(list);

   const preferredId=String(preferredBusinessId||currentAppBusinessId||selectedBusiness||"");
   const appBusiness=list.find(b=>String(getId(b))===preferredId);

   if(appBusiness)
    setSelectedBusiness(String(getId(appBusiness)));
   else if(!selectedBusiness)
    setSelectedBusiness("");
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load businesses"});
  }finally{
   setLoadingBusinesses(false);
  }
 };

 const fetchBusinessTypes=async()=>{
  try{
   setLoadingBusinessTypes(true);
   const res=await api("/api/business-types");
   const list=Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[];
   setBusinessTypes(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load business types"});
  }finally{
   setLoadingBusinessTypes(false);
  }
 };

 const fetchModules=async businessId=>{
  if(!businessId)
  {
   setModuleOptions([]);
   return;
  }

  try{
   setLoadingModules(true);
   const res=await api(`/api/users/permission-modules?business=${encodeURIComponent(String(businessId))}&isActive=true`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];
   setModuleOptions(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load permission modules"});
  }finally{
   setLoadingModules(false);
  }
 };

 const fetchRoles=async businessId=>{
  try{
   setLoadingRoles(true);
   const res=await api(`/api/users/roles?business=${businessId}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];
   setRoles(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load roles"});
  }finally{
   setLoadingRoles(false);
  }
 };

 const fetchDepartments=async businessId=>{
  try{
   setLoadingDepartments(true);
   const res=await api(`/api/users/business-departments?business=${businessId}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];
   setDepartments(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load departments"});
  }finally{
   setLoadingDepartments(false);
  }
 };

 const fetchPermissions=async businessId=>{
  try{
   setLoadingPermissions(true);
   const res=await api(`/api/users/role-permissions?business=${businessId}`);
   setPermissions(Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load permissions"});
  }finally{
   setLoadingPermissions(false);
  }
 };

 const resetRoleForm=(businessId=selectedBusiness)=>{
  setRoleForm({...emptyRoleForm,business:businessId,isActive:true});
  setEditingRoleId("");
  setMessage({type:"",text:""});
 };

 const resetDepartmentForm=(businessId=selectedBusiness)=>{
  setDepartmentForm({...emptyDepartmentForm,business:businessId,isActive:true});
  setEditingDepartmentId("");
  setMessage({type:"",text:""});
 };

 const resetNewModuleForm=()=>{
  setNewModuleForm(emptyNewModuleForm);
 };

 const handleRoleChange=e=>{
  const {name,value,type,checked}=e.target;
  setRoleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));

  if(name==="business")
  {
   selectBusiness(value);
  }
 };

 const handleDepartmentChange=e=>{
  const {name,value,type,checked}=e.target;

  setDepartmentForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));

  if(name==="business")
  {
   selectBusiness(value);
  }
 };

 const selectBusiness=value=>{
  const businessId=String(value||"");
  setSelectedBusiness(businessId);
  const next=new URLSearchParams(searchParams);
  if(businessId)next.set("business",businessId);
  else next.delete("business");
  if(activeTab)next.set("tab",activeTab);
  setSearchParams(next,{replace:true});
 };

 const selectTab=key=>{
  const nextTab=key||"roles";
  setActiveTab(nextTab);
  const next=new URLSearchParams(searchParams);
  if(selectedBusiness)next.set("business",selectedBusiness);
  next.set("tab",nextTab);
  setSearchParams(next,{replace:true});
 };

 const openRoleForm=role=>{
  const roleId=getId(role);

  setActiveTab("roles");
  setEditingRoleId(roleId);

  setRoleForm({
   name:role.name||"",
   business:selectedBusiness,
   description:role.description||"",
   isDefault:!!role.isDefault,
   isActive:role.isActive!==false
  });

  setMessage({type:"info",text:`Editing role: ${role.name||"selected role"}`});

  setTimeout(()=>{
   if(roleFormRef.current)
   {
    roleFormRef.current.scrollIntoView({behavior:"smooth",block:"start"});
   }

   if(roleNameRef.current)
   {
    roleNameRef.current.focus();
   }
  },0);
 };

 const openDepartmentForm=department=>{
  const departmentId=getId(department);

  setActiveTab("departments");
  setEditingDepartmentId(departmentId);

  setDepartmentForm({
   name:department.name||"",
   code:department.code||"",
   accountingCode:department.accountingCode||"",
   business:selectedBusiness,
   description:department.description||"",
   defaultRole:getId(department.defaultRole),
   isDefault:!!department.isDefault,
   isActive:department.isActive!==false
  });

  setMessage({type:"info",text:`Editing department: ${department.name||"selected department"}`});

  setTimeout(()=>{
   if(departmentFormRef.current)
   {
    departmentFormRef.current.scrollIntoView({behavior:"smooth",block:"start"});
   }

   if(departmentNameRef.current)
   {
    departmentNameRef.current.focus();
   }
  },0);
 };

 const handleRoleNameSelect=e=>{
  const roleId=e.target.value;
  const match=roleOptions.find(role=>String(getId(role))===String(roleId));

  if(!match)
  {
   return;
  }

  openRoleForm(match);
 };

 const handleDepartmentSelect=e=>{
  const departmentId=e.target.value;
  const match=departmentOptions.find(department=>String(getId(department))===String(departmentId));

  if(!match)
  {
   return;
  }

  openDepartmentForm(match);
 };

 const handleNewRoleClick=()=>{
  resetRoleForm();

  setTimeout(()=>{
   if(roleFormRef.current)
   {
    roleFormRef.current.scrollIntoView({behavior:"smooth",block:"start"});
   }

   if(roleNameRef.current)
   {
    roleNameRef.current.focus();
   }
  },0);
 };

 const handleNewDepartmentClick=()=>{
  resetDepartmentForm();

  setTimeout(()=>{
   if(departmentFormRef.current)
   {
    departmentFormRef.current.scrollIntoView({behavior:"smooth",block:"start"});
   }

   if(departmentNameRef.current)
   {
    departmentNameRef.current.focus();
   }
  },0);
 };

 const _handleNewModuleChange=e=>{
  const {name,value,type,checked}=e.target;

  if(type==="checkbox"&&name==="admin")
  {
   if(checked)
   {
    setNewModuleForm(prev=>({
     ...prev,
     create:true,
     read:true,
     update:true,
     delete:true,
     admin:true
    }));
    return;
   }

   setNewModuleForm(prev=>({
    ...prev,
    create:false,
    read:false,
    update:false,
    delete:false,
    admin:false
   }));
   return;
  }

  setNewModuleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const submitRole=async e=>{
  e.preventDefault();

  const businessId=selectedBusiness;

  if(!roleForm.name.trim()||!businessId)
  {
   setMessage({type:"danger",text:"Business and role name are required"});
   return;
  }

  const isEditing=!!editingRoleId;

  try{
   setSavingRole(true);
   setMessage({type:"",text:""});

   const payload={
    name:roleForm.name.trim(),
    business:businessId,
    description:roleForm.description.trim(),
    isDefault:!!roleForm.isDefault,
    isActive:!!roleForm.isActive
   };

   if(isEditing)
    await api(`/api/users/roles/${editingRoleId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/roles",{method:"POST",body:JSON.stringify(payload)});

   await fetchRoles(businessId);

   resetRoleForm(businessId);
   setMessage({type:"success",text:isEditing?"Role updated":"Role created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save role"});
  }finally{
   setSavingRole(false);
  }
 };

 const submitDepartment=async e=>{
  e.preventDefault();

  const businessId=selectedBusiness;

  if(!departmentForm.name.trim()||!departmentForm.code.trim()||!businessId)
  {
   setMessage({type:"danger",text:"Business, department name, and department code are required"});
   return;
  }

  const isEditing=!!editingDepartmentId;

  try{
   setSavingDepartment(true);
   setMessage({type:"",text:""});

   const payload={
    name:departmentForm.name.trim(),
    code:departmentForm.code.trim().toUpperCase(),
    accountingCode:departmentForm.accountingCode.trim().toUpperCase(),
    business:businessId,
    description:departmentForm.description.trim(),
    defaultRole:departmentForm.defaultRole||null,
    isDefault:!!departmentForm.isDefault,
    isActive:!!departmentForm.isActive
   };

   if(isEditing)
    await api(`/api/users/business-departments/${editingDepartmentId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/business-departments",{method:"POST",body:JSON.stringify(payload)});

   await fetchDepartments(businessId);

   resetDepartmentForm(businessId);
   setMessage({type:"success",text:isEditing?"Department updated":"Department created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save department"});
  }finally{
   setSavingDepartment(false);
  }
 };

 const editRole=role=>{
  openRoleForm(role);
 };

 const editDepartment=department=>{
  openDepartmentForm(department);
 };

 const deleteRole=async id=>{
  if(!window.confirm("Delete this role?"))return;
  const businessId=selectedBusiness;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/roles/${id}`,{method:"DELETE"});
   await fetchRoles(businessId);
   await fetchPermissions(businessId);
   if(editingRoleId===String(id))resetRoleForm();
   if(String(selectedPermissionRole)===String(id))setSelectedPermissionRole("");
   setMessage({type:"success",text:"Role deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete role"});
  }
 };

 const deleteDepartment=async id=>{
  if(!window.confirm("Delete this department?"))return;
  const businessId=selectedBusiness;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/business-departments/${id}`,{method:"DELETE"});
   await fetchDepartments(businessId);
   if(editingDepartmentId===String(id))resetDepartmentForm();
   setMessage({type:"success",text:"Department deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete department"});
  }
 };

 const updatePermissionRow=async(permissionId,payload)=>{
  const businessId=selectedBusiness;

  try{
   setSavingPermissionById(prev=>({...prev,[permissionId]:true}));
   setMessage({type:"",text:""});

   await api(`/api/users/role-permissions/${permissionId}`,{
    method:"PUT",
    body:JSON.stringify({...payload,business:businessId})
   });

   await fetchPermissions(businessId);
   setMessage({type:"success",text:"Permission updated"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to update permission"});
  }finally{
   setSavingPermissionById(prev=>({...prev,[permissionId]:false}));
  }
 };

 const _createPermissionRow=async e=>{
  e.preventDefault();

  const businessId=selectedBusiness;

  if(!businessId||!selectedPermissionRole||!newModuleForm.module.trim())
  {
   setMessage({type:"danger",text:"Business, role, and module are required"});
   return;
  }

  const moduleName=newModuleForm.module.trim().toLowerCase();
  const exists=selectedRolePermissions.some(permission=>permission.module===moduleName);

  if(exists)
  {
   setMessage({type:"danger",text:"That module already exists for the selected role"});
   return;
  }

  try{
   setSavingNewPermission(true);
   setMessage({type:"",text:""});

   const payload={
    business:businessId,
    role:selectedPermissionRole,
    module:moduleName,
    create:!!newModuleForm.create,
    read:!!newModuleForm.read,
    update:!!newModuleForm.update,
    delete:!!newModuleForm.delete,
    admin:!!newModuleForm.admin
   };

   await api("/api/users/role-permissions",{
    method:"POST",
    body:JSON.stringify(payload)
   });

   await fetchPermissions(businessId);
   resetNewModuleForm();
   setMessage({type:"success",text:"Permission added"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to add permission"});
  }finally{
   setSavingNewPermission(false);
  }
 };

 const deletePermission=async id=>{
  if(!window.confirm("Delete this permission?"))return;
  const businessId=selectedBusiness;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/role-permissions/${id}`,{method:"DELETE"});
   await fetchPermissions(businessId);
   setMessage({type:"success",text:"Permission deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete permission"});
  }
 };

 const PermissionRow=({permission})=>{
  const [rowState,setRowState]=useState({
   module:permission.module||"",
   create:!!permission.create,
   read:!!permission.read,
   update:!!permission.update,
   delete:!!permission.delete,
   admin:!!permission.admin
  });

  useEffect(()=>{
   setRowState({
    module:permission.module||"",
    create:!!permission.create,
    read:!!permission.read,
    update:!!permission.update,
    delete:!!permission.delete,
    admin:!!permission.admin
   });
  },[permission._id,permission.module,permission.create,permission.read,permission.update,permission.delete,permission.admin]);

  const isSaving=!!savingPermissionById[getId(permission)];

  const handleChange=e=>{
   const {name,value,type,checked}=e.target;
   setRowState(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
  };

  const handleAdminToggle=checked=>{
   if(checked)
   {
    setRowState(prev=>({
     ...prev,
     create:true,
     read:true,
     update:true,
     delete:true,
     admin:true
    }));
    return;
   }

   setRowState(prev=>({
    ...prev,
    create:false,
    read:false,
    update:false,
    delete:false,
    admin:false
   }));
  };

  const handleSave=()=>{
   if(!rowState.module.trim())
   {
    setMessage({type:"danger",text:"Module is required"});
    return;
   }

   updatePermissionRow(getId(permission),{
    business:selectedBusiness,
    role:selectedPermissionRole,
    module:rowState.module.trim().toLowerCase(),
    create:!!rowState.create,
    read:!!rowState.read,
    update:!!rowState.update,
    delete:!!rowState.delete,
    admin:!!rowState.admin
   });
  };

  return(
   <tr>
    <td>
     <Form.Select value={rowState.module} name="module" onChange={handleChange}>
      <option value="">Select module</option>
      {moduleSelectOptions.map(module=>(
       <option key={module.value} value={module.value}>{module.label}</option>
      ))}
     </Form.Select>
    </td>
    <td>
     <Form.Check type="checkbox" name="create" checked={rowState.create} onChange={handleChange}/>
    </td>
    <td>
     <Form.Check type="checkbox" name="read" checked={rowState.read} onChange={handleChange}/>
    </td>
    <td>
     <Form.Check type="checkbox" name="update" checked={rowState.update} onChange={handleChange}/>
    </td>
    <td>
     <Form.Check type="checkbox" name="delete" checked={rowState.delete} onChange={handleChange}/>
    </td>
    <td>
     <Form.Check type="checkbox" name="admin" checked={rowState.admin} onChange={e=>handleAdminToggle(e.target.checked)}/>
    </td>
    <td className="text-end">
     <ButtonGroup size="sm">
      <Button variant="outline-success" onClick={handleSave} disabled={isSaving}>
       {isSaving?<Spinner size="sm" animation="border"/>:<Save size={14}/>}
      </Button>
      <Button variant="outline-danger" onClick={()=>deletePermission(getId(permission))}>
       <Trash2 size={14}/>
      </Button>
     </ButtonGroup>
    </td>
   </tr>
  );
 };

 return(
  <div className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={7}>
         <div className="d-flex align-items-center gap-2 mb-2">
          <Shield size={20}/>
          <h3 className="mb-0">Business Roles & Permissions</h3>
         </div>
         <div className="text-muted">Manage business roles, departments, and permissions by selected business.</div>
        </Col>

        <Col md={5}>
         <Form.Group>
          <Form.Label>Select Business</Form.Label>
          <div className="d-flex gap-2">
           <Form.Select value={selectedBusiness} onChange={e=>selectBusiness(e.target.value)} disabled={loadingBusinesses||loadingCurrentBusiness}>
            <option value="">Select business</option>
            {businesses.map(b=>(
             <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
            ))}
           </Form.Select>

           <Button variant="outline-secondary" onClick={()=>fetchBusinesses(currentAppBusinessId)} disabled={loadingBusinesses||loadingBusinessTypes||loadingCurrentBusiness}>
            {loadingBusinesses||loadingBusinessTypes||loadingCurrentBusiness?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
           </Button>
          </div>
         </Form.Group>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {message.text?(
     <Col xs={12}>
      <Alert variant={message.type||"info"} className="mb-0">{message.text}</Alert>
     </Col>
    ):null}

    <Col xs={12}>
     <Tabs activeKey={activeTab} onSelect={selectTab} className="mb-3">

      <Tab eventKey="roles" title="Roles">
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={roleFormRef}>
          <Card.Header className="d-flex align-items-center gap-2">
           <UserCog size={18}/>
           <span>{editingRoleId?"Edit Role":"Add Role"}</span>
          </Card.Header>

          <Card.Body>
           <Form onSubmit={submitRole}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>Business</Form.Label>
               <Form.Select name="business" value={roleForm.business} onChange={handleRoleChange} required>
                <option value="">Select business</option>
                {businesses.map(b=>(
                 <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Existing Roles</Form.Label>
               <div className="d-flex gap-2">
                <Form.Select value={editingRoleId} onChange={handleRoleNameSelect} disabled={!selectedBusiness||loadingRoles}>
                 <option value="">Select existing role to edit</option>
                 {roleOptions.map(role=>(
                  <option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>
                 ))}
                </Form.Select>

                <Button type="button" variant="outline-secondary" onClick={()=>fetchRoles(selectedBusiness)} disabled={!selectedBusiness||loadingRoles}>
                 {loadingRoles?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
                </Button>
               </div>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Role Name</Form.Label>
               <Form.Control ref={roleNameRef} name="name" value={roleForm.name} onChange={handleRoleChange} placeholder="Type new role name or edit selected role" required />
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={4} name="description" value={roleForm.description} onChange={handleRoleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsDefault" name="isDefault" label="Default role" checked={roleForm.isDefault} onChange={handleRoleChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsActive" name="isActive" label="Active" checked={roleForm.isActive} onChange={handleRoleChange}/>
             </Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingRole||!selectedBusiness}>
               {savingRole?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingRoleId?"Update Role":"Add Role"}</span>
              </Button>

              <Button type="button" variant="outline-primary" onClick={handleNewRoleClick}>New Role</Button>
              <Button type="button" variant="outline-secondary" onClick={resetRoleForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>Roles</span>
           {loadingRoles?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>

            <tbody>
             {!loadingRoles&&roleOptions.length===0?(
              <tr>
               <td colSpan="5" className="text-center py-4 text-muted">No roles found.</td>
              </tr>
             ):null}

             {roleOptions.map(role=>(
              <tr key={getId(role)}>
               <td>{role.name}</td>
               <td>{role.description||"-"}</td>
               <td>
                <Badge bg={role.isDefault?"primary":"secondary"}>{role.isDefault?"Default":"Custom"}</Badge>
               </td>
               <td>
                <Badge bg={role.isActive?"success":"secondary"}>{role.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>editRole(role)}>
                  <Edit size={14}/>
                 </Button>
                 <Button type="button" variant="outline-danger" onClick={()=>deleteRole(getId(role))}>
                  <Trash2 size={14}/>
                 </Button>
                </ButtonGroup>
               </td>
              </tr>
             ))}
            </tbody>
           </Table>
          </Card.Body>
         </Card>
        </Col>
       </Row>
      </Tab>

      <Tab eventKey="departments" title="Departments">
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={departmentFormRef}>
          <Card.Header className="d-flex align-items-center gap-2">
           <Building2 size={18}/>
           <span>{editingDepartmentId?"Edit Department":"Add Department"}</span>
          </Card.Header>

          <Card.Body>
           <Form onSubmit={submitDepartment}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>Business</Form.Label>
               <Form.Select name="business" value={departmentForm.business} onChange={handleDepartmentChange} required>
                <option value="">Select business</option>
                {businesses.map(b=>(
                 <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Existing Departments</Form.Label>
               <div className="d-flex gap-2">
                <Form.Select value={editingDepartmentId} onChange={handleDepartmentSelect} disabled={!selectedBusiness||loadingDepartments}>
                 <option value="">Select existing department to edit</option>
                 {departmentOptions.map(department=>(
                  <option key={getId(department)} value={getId(department)}>{getDepartmentLabel(department)}</option>
                 ))}
                </Form.Select>

                <Button type="button" variant="outline-secondary" onClick={()=>fetchDepartments(selectedBusiness)} disabled={!selectedBusiness||loadingDepartments}>
                 {loadingDepartments?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
                </Button>
               </div>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department Name</Form.Label>
               <Form.Control ref={departmentNameRef} name="name" value={departmentForm.name} onChange={handleDepartmentChange} placeholder="Garden Team, Admin Office, Kitchen" required />
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department Code</Form.Label>
               <Form.Control name="code" value={departmentForm.code} onChange={handleDepartmentChange} placeholder="GDN, ADM, KIT, INV" required />
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Accounting Code</Form.Label>
               <Form.Control name="accountingCode" value={departmentForm.accountingCode} onChange={handleDepartmentChange} placeholder="4000, 5100, DEPT-100, COST-220" />
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Default Role</Form.Label>
               <Form.Select name="defaultRole" value={departmentForm.defaultRole} onChange={handleDepartmentChange}>
                <option value="">No default role</option>
                {roleOptions.map(role=>(
                 <option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={4} name="description" value={departmentForm.description} onChange={handleDepartmentChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="departmentIsDefault" name="isDefault" label="Default department" checked={departmentForm.isDefault} onChange={handleDepartmentChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="departmentIsActive" name="isActive" label="Active" checked={departmentForm.isActive} onChange={handleDepartmentChange}/>
             </Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingDepartment||!selectedBusiness}>
               {savingDepartment?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingDepartmentId?"Update Department":"Add Department"}</span>
              </Button>

              <Button type="button" variant="outline-primary" onClick={handleNewDepartmentClick}>New Department</Button>
              <Button type="button" variant="outline-secondary" onClick={resetDepartmentForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>Departments</span>
           {loadingDepartments?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Accounting Code</th>
              <th>Default Role</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>

            <tbody>
             {!loadingDepartments&&departmentOptions.length===0?(
              <tr>
               <td colSpan="7" className="text-center py-4 text-muted">No departments found.</td>
              </tr>
             ):null}

             {departmentOptions.map(department=>(
              <tr key={getId(department)}>
               <td>{department.name}</td>
               <td>{department.code||"-"}</td>
               <td>{department.accountingCode||"-"}</td>
               <td>{department.defaultRole?.name||"-"}</td>
               <td>
                <Badge bg={department.isDefault?"primary":"secondary"}>{department.isDefault?"Default":"Custom"}</Badge>
               </td>
               <td>
                <Badge bg={department.isActive?"success":"secondary"}>{department.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>editDepartment(department)}>
                  <Edit size={14}/>
                 </Button>
                 <Button type="button" variant="outline-danger" onClick={()=>deleteDepartment(getId(department))}>
                  <Trash2 size={14}/>
                 </Button>
                </ButtonGroup>
               </td>
              </tr>
             ))}
            </tbody>
           </Table>
          </Card.Body>
         </Card>
        </Col>
       </Row>
      </Tab>

      <Tab eventKey="permissions" title="Permissions" disabled={!selectedBusiness}>
       <div className="mt-4">
        <PermissionMatrix businessId={selectedBusiness} embedded/>
       </div>
      </Tab>
     </Tabs>
    </Col>
   </Row>
  </div>
 );
}
