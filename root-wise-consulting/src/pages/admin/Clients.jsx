// frontend/src/pages/admin/BusinessRolesPermissionsPage.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Row,Spinner,Table,Tabs,Tab} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Save,Shield,Trash2,UserCog,Building2} from "lucide-react";

const defaultBusinessId="";
const emptyRoleForm={
 name:"",
 label:"",
 business:"",
 description:"",
 rank:100,
 isSystem:false,
 isDefault:false,
 isActive:true
};
const emptyDepartmentForm={
 name:"",
 code:"",
 accountingCode:"",
 business:"",
 description:"",
 defaultRole:"",
 isSystem:false,
 isDefault:false,
 isActive:true
};
const emptyAssignmentForm={
 user:"",
 business:"",
 department:"",
 roleOverride:"",
 isPrimary:false,
 isActive:true
};
const emptyNewModuleForm={module:"",create:false,read:true,update:false,delete:false,admin:false};

export default function BusinessRolesPermissionsPage(){
 const [businesses,setBusinesses]=useState([]);
 const [selectedBusiness,setSelectedBusiness]=useState(defaultBusinessId);
 const [currentAppBusinessId,setCurrentAppBusinessId]=useState(defaultBusinessId);
 const [roles,setRoles]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [permissions,setPermissions]=useState([]);
 const [users,setUsers]=useState([]);
 const [departmentAssignments,setDepartmentAssignments]=useState([]);
 const [moduleOptions,setModuleOptions]=useState([]);
 const [loadingBusinesses,setLoadingBusinesses]=useState(false);
 const [loadingCurrentBusiness,setLoadingCurrentBusiness]=useState(false);
 const [loadingRoles,setLoadingRoles]=useState(false);
 const [loadingDepartments,setLoadingDepartments]=useState(false);
 const [loadingPermissions,setLoadingPermissions]=useState(false);
 const [loadingUsers,setLoadingUsers]=useState(false);
 const [loadingDepartmentAssignments,setLoadingDepartmentAssignments]=useState(false);
 const [loadingModules,setLoadingModules]=useState(false);
 const [savingRole,setSavingRole]=useState(false);
 const [savingDepartment,setSavingDepartment]=useState(false);
 const [savingAssignment,setSavingAssignment]=useState(false);
 const [savingPermissionById,setSavingPermissionById]=useState({});
 const [savingNewPermission,setSavingNewPermission]=useState(false);
 const [roleForm,setRoleForm]=useState({...emptyRoleForm,business:defaultBusinessId});
 const [departmentForm,setDepartmentForm]=useState({...emptyDepartmentForm,business:defaultBusinessId});
 const [assignmentForm,setAssignmentForm]=useState({...emptyAssignmentForm,business:defaultBusinessId});
 const [editingRoleId,setEditingRoleId]=useState("");
 const [editingDepartmentId,setEditingDepartmentId]=useState("");
 const [editingAssignmentId,setEditingAssignmentId]=useState("");
 const [activeTab,setActiveTab]=useState("roles");
 const [message,setMessage]=useState({type:"",text:""});
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loadingBusinessTypes,setLoadingBusinessTypes]=useState(false);
 const [selectedPermissionRole,setSelectedPermissionRole]=useState("");
 const [newModuleForm,setNewModuleForm]=useState(emptyNewModuleForm);

 const roleFormRef=useRef(null);
 const roleNameRef=useRef(null);
 const departmentFormRef=useRef(null);
 const departmentNameRef=useRef(null);
 const assignmentFormRef=useRef(null);

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

 const getId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;

  if(typeof value==="object"){
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
   if(typeof value.id==="string")return value.id;
   if(typeof value.$oid==="string")return value.$oid;
  }

  return "";
 };

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

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

 const getRoleDisplayName=role=>{
  return String(role?.label||role?.name||"").trim();
 };

 const getRoleLabel=role=>{
  const name=getRoleDisplayName(role);
  const status=role?.isActive===false?"Inactive":"Active";
  const defaultText=role?.isDefault?"Default":"Custom";
  const systemText=role?.isSystem?"System":"Editable";

  return `${name}${name?` (${defaultText}, ${systemText}, ${status})`:""}`;
 };

 const getDepartmentLabel=department=>{
  const name=String(department?.name||"").trim();
  const code=String(department?.code||"").trim();
  const accountingCode=String(department?.accountingCode||"").trim();
  const status=department?.isActive===false?"Inactive":"Active";
  const defaultText=department?.isDefault?"Default":"Custom";
  const systemText=department?.isSystem?"System":"Editable";

  return `${name}${code?` [${code}]`:""}${accountingCode?` ${accountingCode}`:""}${name?` (${defaultText}, ${systemText}, ${status})`:""}`;
 };

 const getUserLabel=user=>{
  const username=String(user?.username||"").trim();
  const email=String(user?.email||"").trim();
  const detailName=[
   user?.details?.firstName,
   user?.details?.lastName
  ].filter(Boolean).join(" ").trim();
  const label=detailName||username||email||"Unnamed user";

  return `${label}${email&&email!==label?` (${email})`:""}`;
 };

 const getAssignmentInheritedRole=assignment=>{
  return assignment?.roleOverride||assignment?.department?.defaultRole||null;
 };

 const getAssignmentRoleLabel=assignment=>{
  const role=getAssignmentInheritedRole(assignment);
  const roleName=getRoleDisplayName(role)||"No role";
  return assignment?.roleOverride?`${roleName} (override)`:roleName;
 };

 const normalizeModuleOption=item=>{
  if(typeof item==="string"){
   return{
    value:item,
    label:item.replace(/_/g," ").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase())
   };
  }

  return{
   value:String(item?.key||item?.value||item?.module||""),
   label:String(item?.label||item?.name||item?.key||item?.value||item?.module||"")
  };
 };

 const normalizedModuleOptions=useMemo(()=>{
  return moduleOptions.map(normalizeModuleOption).filter(module=>module.value);
 },[moduleOptions]);

 const roleOptions=useMemo(()=>{
  return [...roles].sort((a,b)=>{
   if(a.isDefault!==b.isDefault)return a.isDefault?-1:1;
   if(Number(a.rank||100)!==Number(b.rank||100))return Number(a.rank||100)-Number(b.rank||100);
   return String(a.label||a.name||"").localeCompare(String(b.label||b.name||""));
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

 useEffect(()=>{
  const init=async()=>{
   const currentBusinessId=await loadCurrentAppBusiness();
   fetchBusinesses(currentBusinessId);
   fetchBusinessTypes();
  };

  init();
 },[]);

 useEffect(()=>{
  if(!selectedBusiness){
   setRoles([]);
   setDepartments([]);
   setPermissions([]);
   setDepartmentAssignments([]);
   setModuleOptions([]);
   setUsers([]);
   setRoleForm(prev=>({...prev,business:""}));
   setDepartmentForm(prev=>({...prev,business:""}));
   setAssignmentForm(prev=>({...prev,business:""}));
   setSelectedPermissionRole("");
   return;
  }

  const businessId=String(selectedBusiness);

  setRoleForm(prev=>({...prev,business:businessId}));
  setDepartmentForm(prev=>({...prev,business:businessId}));
  setAssignmentForm(prev=>({...prev,business:businessId}));

  fetchRoles(businessId);
  fetchDepartments(businessId);
  fetchPermissions(businessId);
  fetchUsers(businessId);
  fetchDepartmentAssignments(businessId);
  fetchModules();
 },[selectedBusiness]);

 useEffect(()=>{
  if(!selectedBusiness){
   setSelectedPermissionRole("");
   return;
  }

  if(!selectedPermissionRole&&roleOptions.length>0){
   setSelectedPermissionRole(String(getId(roleOptions[0])));
   return;
  }

  if(selectedPermissionRole&&!roleOptions.some(role=>String(getId(role))===String(selectedPermissionRole))){
   setSelectedPermissionRole(roleOptions.length?String(getId(roleOptions[0])):"");
  }
 },[roleOptions,selectedBusiness,selectedPermissionRole]);

 const loadCurrentAppBusiness=async()=>{
  try{
   setLoadingCurrentBusiness(true);
   const appKey=getRuntimeAppKey();

   if(!appKey){
    setCurrentAppBusinessId("");
    return "";
   }

   const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
    cache:"no-store",
    headers:{
     "Cache-Control":"no-cache",
     "Pragma":"no-cache"
    }
   });

   if(!res.ok){
    setCurrentAppBusinessId("");
    return "";
   }

   const data=await res.json().catch(()=>null);
   const business=unwrapBusiness(data);
   const businessId=getId(business);

   setCurrentAppBusinessId(businessId);
   if(businessId)setSelectedBusiness(businessId);

   return businessId;
  }catch{
   setCurrentAppBusinessId("");
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
   const existingSelected=list.find(b=>String(getId(b))===preferredId);

   if(existingSelected)setSelectedBusiness(String(getId(existingSelected)));
   else setSelectedBusiness("");
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

 const fetchModules=async()=>{
  const appKey=getRuntimeAppKey();

  if(!appKey){
   setModuleOptions([]);
   return;
  }

  try{
   setLoadingModules(true);
   const res=await api(`/api/users/permission-modules?appKey=${encodeURIComponent(appKey)}&isActive=true`);
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
   const res=await api(`/api/users/roles?business=${encodeURIComponent(String(businessId))}`);
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
   const res=await api(`/api/users/business-departments?business=${encodeURIComponent(String(businessId))}`);
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
   const res=await api(`/api/users/role-permissions?business=${encodeURIComponent(String(businessId))}`);
   setPermissions(Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load permissions"});
  }finally{
   setLoadingPermissions(false);
  }
 };

 const fetchUsers=async businessId=>{
  try{
   setLoadingUsers(true);
   const res=await api(`/api/users?business=${encodeURIComponent(String(businessId||selectedBusiness))}`);
   setUsers(Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load users"});
  }finally{
   setLoadingUsers(false);
  }
 };

 const fetchDepartmentAssignments=async businessId=>{
  try{
   setLoadingDepartmentAssignments(true);
   const res=await api(`/api/users/department-assignments?business=${encodeURIComponent(String(businessId))}`);
   setDepartmentAssignments(Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load department assignments"});
  }finally{
   setLoadingDepartmentAssignments(false);
  }
 };

 const resetRoleForm=()=>{
  setRoleForm({...emptyRoleForm,business:selectedBusiness,isActive:true});
  setEditingRoleId("");
  setMessage({type:"",text:""});
 };

 const resetDepartmentForm=()=>{
  setDepartmentForm({...emptyDepartmentForm,business:selectedBusiness,isActive:true});
  setEditingDepartmentId("");
  setMessage({type:"",text:""});
 };

 const resetAssignmentForm=()=>{
  setAssignmentForm({...emptyAssignmentForm,business:selectedBusiness,isActive:true});
  setEditingAssignmentId("");
  setMessage({type:"",text:""});
 };

 const resetNewModuleForm=()=>{
  setNewModuleForm(emptyNewModuleForm);
 };

 const handleRoleChange=e=>{
  const {name,value,type,checked}=e.target;
  setRoleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleDepartmentChange=e=>{
  const {name,value,type,checked}=e.target;
  setDepartmentForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleAssignmentChange=e=>{
  const {name,value,type,checked}=e.target;
  setAssignmentForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const openRoleForm=role=>{
  const roleId=getId(role);

  setActiveTab("roles");
  setEditingRoleId(roleId);

  setRoleForm({
   name:role.name||"",
   label:role.label||"",
   business:selectedBusiness,
   description:role.description||"",
   rank:role.rank??100,
   isSystem:!!role.isSystem,
   isDefault:!!role.isDefault,
   isActive:role.isActive!==false
  });

  setMessage({type:"info",text:`Editing role: ${getRoleDisplayName(role)||"selected role"}`});

  setTimeout(()=>{
   roleFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
   roleNameRef.current?.focus();
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
   isSystem:!!department.isSystem,
   isDefault:!!department.isDefault,
   isActive:department.isActive!==false
  });

  setMessage({type:"info",text:`Editing department: ${department.name||"selected department"}`});

  setTimeout(()=>{
   departmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
   departmentNameRef.current?.focus();
  },0);
 };

 const openAssignmentForm=assignment=>{
  const assignmentId=getId(assignment);

  setActiveTab("assignments");
  setEditingAssignmentId(assignmentId);

  setAssignmentForm({
   user:getId(assignment.user),
   business:selectedBusiness,
   department:getId(assignment.department),
   roleOverride:getId(assignment.roleOverride),
   isPrimary:!!assignment.isPrimary,
   isActive:assignment.isActive!==false
  });

  setMessage({type:"info",text:`Editing assignment: ${getUserLabel(assignment.user)}`});

  setTimeout(()=>{
   assignmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const handleRoleNameSelect=e=>{
  const roleId=e.target.value;
  const match=roleOptions.find(role=>String(getId(role))===String(roleId));
  if(match)openRoleForm(match);
 };

 const handleDepartmentSelect=e=>{
  const departmentId=e.target.value;
  const match=departmentOptions.find(department=>String(getId(department))===String(departmentId));
  if(match)openDepartmentForm(match);
 };

 const handleNewRoleClick=()=>{
  resetRoleForm();
  setTimeout(()=>{
   roleFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
   roleNameRef.current?.focus();
  },0);
 };

 const handleNewDepartmentClick=()=>{
  resetDepartmentForm();
  setTimeout(()=>{
   departmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
   departmentNameRef.current?.focus();
  },0);
 };

 const handleNewAssignmentClick=()=>{
  resetAssignmentForm();
  setTimeout(()=>{
   assignmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const handleNewModuleChange=e=>{
  const {name,value,type,checked}=e.target;

  if(type==="checkbox"&&name==="admin"){
   if(checked){
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

  if(!roleForm.name.trim()||!roleForm.business){
   setMessage({type:"danger",text:"Business and role name are required"});
   return;
  }

  const isEditing=!!editingRoleId;

  try{
   setSavingRole(true);
   setMessage({type:"",text:""});

   const payload={
    name:roleForm.name.trim().toLowerCase(),
    label:roleForm.label.trim(),
    business:roleForm.business,
    description:roleForm.description.trim(),
    rank:Number(roleForm.rank)||100,
    isSystem:!!roleForm.isSystem,
    isDefault:!!roleForm.isDefault,
    isActive:!!roleForm.isActive
   };

   if(isEditing)
    await api(`/api/users/roles/${editingRoleId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/roles",{method:"POST",body:JSON.stringify(payload)});

   await fetchRoles(roleForm.business);

   if(String(selectedBusiness)!==String(roleForm.business))
    setSelectedBusiness(roleForm.business);

   resetRoleForm();
   setMessage({type:"success",text:isEditing?"Role updated":"Role created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save role"});
  }finally{
   setSavingRole(false);
  }
 };

 const submitDepartment=async e=>{
  e.preventDefault();

  if(!departmentForm.name.trim()||!departmentForm.code.trim()||!departmentForm.business){
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
    business:departmentForm.business,
    description:departmentForm.description.trim(),
    defaultRole:departmentForm.defaultRole||null,
    isSystem:!!departmentForm.isSystem,
    isDefault:!!departmentForm.isDefault,
    isActive:!!departmentForm.isActive
   };

   if(isEditing)
    await api(`/api/users/business-departments/${editingDepartmentId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/business-departments",{method:"POST",body:JSON.stringify(payload)});

   await fetchDepartments(departmentForm.business);

   if(String(selectedBusiness)!==String(departmentForm.business))
    setSelectedBusiness(departmentForm.business);

   resetDepartmentForm();
   setMessage({type:"success",text:isEditing?"Department updated":"Department created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save department"});
  }finally{
   setSavingDepartment(false);
  }
 };

 const submitAssignment=async e=>{
  e.preventDefault();

  if(!assignmentForm.user||!assignmentForm.business||!assignmentForm.department){
   setMessage({type:"danger",text:"User, business, and department are required"});
   return;
  }

  const isEditing=!!editingAssignmentId;

  try{
   setSavingAssignment(true);
   setMessage({type:"",text:""});

   const payload={
    user:assignmentForm.user,
    business:assignmentForm.business,
    department:assignmentForm.department,
    roleOverride:assignmentForm.roleOverride||null,
    isPrimary:!!assignmentForm.isPrimary,
    isActive:!!assignmentForm.isActive
   };

   if(isEditing)
    await api(`/api/users/department-assignments/${editingAssignmentId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/department-assignments",{method:"POST",body:JSON.stringify(payload)});

   await fetchDepartmentAssignments(assignmentForm.business);

   if(String(selectedBusiness)!==String(assignmentForm.business))
    setSelectedBusiness(assignmentForm.business);

   resetAssignmentForm();
   setMessage({type:"success",text:isEditing?"User department assignment updated":"User department assignment created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save user department assignment"});
  }finally{
   setSavingAssignment(false);
  }
 };

 const deleteRole=async id=>{
  if(!window.confirm("Delete this role?"))return;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/roles/${id}`,{method:"DELETE"});
   await fetchRoles(selectedBusiness);
   await fetchPermissions(selectedBusiness);
   if(editingRoleId===String(id))resetRoleForm();
   if(String(selectedPermissionRole)===String(id))setSelectedPermissionRole("");
   setMessage({type:"success",text:"Role deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete role"});
  }
 };

 const deleteDepartment=async id=>{
  if(!window.confirm("Delete this department?"))return;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/business-departments/${id}`,{method:"DELETE"});
   await fetchDepartments(selectedBusiness);
   if(editingDepartmentId===String(id))resetDepartmentForm();
   setMessage({type:"success",text:"Department deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete department"});
  }
 };

 const deleteAssignment=async id=>{
  if(!window.confirm("Remove this user from the department?"))return;

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/department-assignments/${id}`,{method:"DELETE"});
   await fetchDepartmentAssignments(selectedBusiness);
   if(editingAssignmentId===String(id))resetAssignmentForm();
   setMessage({type:"success",text:"User department assignment deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete user department assignment"});
  }
 };

 const updatePermissionRow=async(permissionId,payload)=>{
  try{
   setSavingPermissionById(prev=>({...prev,[permissionId]:true}));
   setMessage({type:"",text:""});

   await api(`/api/users/role-permissions/${permissionId}`,{
    method:"PUT",
    body:JSON.stringify(payload)
   });

   await fetchPermissions(selectedBusiness);
   setMessage({type:"success",text:"Permission updated"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to update permission"});
  }finally{
   setSavingPermissionById(prev=>({...prev,[permissionId]:false}));
  }
 };

 const createPermissionRow=async e=>{
  e.preventDefault();

  if(!selectedBusiness||!selectedPermissionRole||!newModuleForm.module.trim()){
   setMessage({type:"danger",text:"Business, role, and module are required"});
   return;
  }

  const moduleName=newModuleForm.module.trim().toLowerCase();
  const exists=selectedRolePermissions.some(permission=>permission.module===moduleName);

  if(exists){
   setMessage({type:"danger",text:"That module already exists for the selected role"});
   return;
  }

  try{
   setSavingNewPermission(true);
   setMessage({type:"",text:""});

   const payload={
    business:selectedBusiness,
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

   await fetchPermissions(selectedBusiness);
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

  try{
   setMessage({type:"",text:""});
   await api(`/api/users/role-permissions/${id}`,{method:"DELETE"});
   await fetchPermissions(selectedBusiness);
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
   if(checked){
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
   if(!rowState.module.trim()){
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
      {normalizedModuleOptions.map(module=>(
       <option key={module.value} value={module.value}>{module.label}</option>
      ))}
     </Form.Select>
    </td>
    <td><Form.Check type="checkbox" name="create" checked={rowState.create} onChange={handleChange}/></td>
    <td><Form.Check type="checkbox" name="read" checked={rowState.read} onChange={handleChange}/></td>
    <td><Form.Check type="checkbox" name="update" checked={rowState.update} onChange={handleChange}/></td>
    <td><Form.Check type="checkbox" name="delete" checked={rowState.delete} onChange={handleChange}/></td>
    <td><Form.Check type="checkbox" name="admin" checked={rowState.admin} onChange={e=>handleAdminToggle(e.target.checked)}/></td>
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
         <div className="text-muted">Manage business roles, departments, assignments, and permissions.</div>
        </Col>

        <Col md={5}>
         <Form.Group>
          <Form.Label>Select Business</Form.Label>
          <div className="d-flex gap-2">
           <Form.Select value={selectedBusiness} onChange={e=>setSelectedBusiness(e.target.value)} disabled={loadingBusinesses||loadingCurrentBusiness}>
            <option value="">Select business</option>
            {businesses.map(b=>(
             <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
            ))}
           </Form.Select>

           <Button variant="outline-secondary" onClick={()=>fetchBusinesses()} disabled={loadingBusinesses||loadingBusinessTypes||loadingCurrentBusiness}>
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
     <Tabs activeKey={activeTab} onSelect={k=>setActiveTab(k||"roles")} className="mb-3">
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
               <Form.Control ref={roleNameRef} name="name" value={roleForm.name} onChange={handleRoleChange} placeholder="owner, admin, manager, staff" required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Display Label</Form.Label>
               <Form.Control name="label" value={roleForm.label} onChange={handleRoleChange} placeholder="Owner, Admin, Manager, Staff"/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Rank</Form.Label>
               <Form.Control type="number" name="rank" value={roleForm.rank} onChange={handleRoleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={4} name="description" value={roleForm.description} onChange={handleRoleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsSystem" name="isSystem" label="System role" checked={roleForm.isSystem} onChange={handleRoleChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsDefault" name="isDefault" label="Default role" checked={roleForm.isDefault} onChange={handleRoleChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsActive" name="isActive" label="Active" checked={roleForm.isActive} onChange={handleRoleChange}/>
             </Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingRole||!roleForm.business}>
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
              <th>Label</th>
              <th>Rank</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>

            <tbody>
             {!loadingRoles&&roleOptions.length===0?(
              <tr>
               <td colSpan="7" className="text-center py-4 text-muted">No roles found.</td>
              </tr>
             ):null}

             {roleOptions.map(role=>(
              <tr key={getId(role)}>
               <td>{role.name}</td>
               <td>{role.label||"-"}</td>
               <td>{role.rank??"-"}</td>
               <td>{role.description||"-"}</td>
               <td>
                <Badge bg={role.isSystem?"dark":role.isDefault?"primary":"secondary"}>
                 {role.isSystem?"System":role.isDefault?"Default":"Custom"}
                </Badge>
               </td>
               <td>
                <Badge bg={role.isActive?"success":"secondary"}>{role.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openRoleForm(role)}>
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
               <Form.Control ref={departmentNameRef} name="name" value={departmentForm.name} onChange={handleDepartmentChange} required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department Code</Form.Label>
               <Form.Control name="code" value={departmentForm.code} onChange={handleDepartmentChange} required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Accounting Code</Form.Label>
               <Form.Control name="accountingCode" value={departmentForm.accountingCode} onChange={handleDepartmentChange}/>
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
              <Form.Check type="switch" id="departmentIsSystem" name="isSystem" label="System department" checked={departmentForm.isSystem} onChange={handleDepartmentChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="departmentIsDefault" name="isDefault" label="Default department" checked={departmentForm.isDefault} onChange={handleDepartmentChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="departmentIsActive" name="isActive" label="Active" checked={departmentForm.isActive} onChange={handleDepartmentChange}/>
             </Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingDepartment||!departmentForm.business}>
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
               <td>{getRoleDisplayName(department.defaultRole)||"-"}</td>
               <td>
                <Badge bg={department.isSystem?"dark":department.isDefault?"primary":"secondary"}>
                 {department.isSystem?"System":department.isDefault?"Default":"Custom"}
                </Badge>
               </td>
               <td>
                <Badge bg={department.isActive?"success":"secondary"}>{department.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openDepartmentForm(department)}>
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

      <Tab eventKey="assignments" title="Assignments" disabled={!selectedBusiness}>
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={assignmentFormRef}>
          <Card.Header className="d-flex align-items-center gap-2">
           <UserCog size={18}/>
           <span>{editingAssignmentId?"Edit User Department":"Assign User to Department"}</span>
          </Card.Header>

          <Card.Body>
           <Form onSubmit={submitAssignment}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>Business</Form.Label>
               <Form.Select name="business" value={assignmentForm.business} onChange={handleAssignmentChange} required>
                <option value="">Select business</option>
                {businesses.map(b=>(
                 <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>User</Form.Label>
               <div className="d-flex gap-2">
                <Form.Select name="user" value={assignmentForm.user} onChange={handleAssignmentChange} required disabled={loadingUsers}>
                 <option value="">Select user</option>
                 {users.map(user=>(
                  <option key={getId(user)} value={getId(user)}>{getUserLabel(user)}</option>
                 ))}
                </Form.Select>

                <Button type="button" variant="outline-secondary" onClick={()=>fetchUsers(selectedBusiness)} disabled={loadingUsers}>
                 {loadingUsers?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
                </Button>
               </div>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department</Form.Label>
               <Form.Select name="department" value={assignmentForm.department} onChange={handleAssignmentChange} required disabled={!selectedBusiness||loadingDepartments}>
                <option value="">Select department</option>
                {departmentOptions.map(department=>(
                 <option key={getId(department)} value={getId(department)}>{getDepartmentLabel(department)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Role Override</Form.Label>
               <Form.Select name="roleOverride" value={assignmentForm.roleOverride} onChange={handleAssignmentChange}>
                <option value="">Inherit department default role</option>
                {roleOptions.map(role=>(
                 <option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="assignmentIsPrimary" name="isPrimary" label="Primary department" checked={assignmentForm.isPrimary} onChange={handleAssignmentChange}/>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="assignmentIsActive" name="isActive" label="Active" checked={assignmentForm.isActive} onChange={handleAssignmentChange}/>
             </Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingAssignment||!assignmentForm.business||!assignmentForm.user||!assignmentForm.department}>
               {savingAssignment?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingAssignmentId?"Update Assignment":"Assign User"}</span>
              </Button>

              <Button type="button" variant="outline-primary" onClick={handleNewAssignmentClick}>New Assignment</Button>
              <Button type="button" variant="outline-secondary" onClick={resetAssignmentForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>User Department Assignments</span>
           {loadingDepartmentAssignments?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>User</th>
              <th>Department</th>
              <th>Effective Role</th>
              <th>Primary</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>

            <tbody>
             {!loadingDepartmentAssignments&&departmentAssignments.length===0?(
              <tr>
               <td colSpan="6" className="text-center py-4 text-muted">No user department assignments found.</td>
              </tr>
             ):null}

             {departmentAssignments.map(assignment=>(
              <tr key={getId(assignment)}>
               <td>{getUserLabel(assignment.user)}</td>
               <td>{assignment.department?.name||"-"}</td>
               <td>{getAssignmentRoleLabel(assignment)}</td>
               <td>
                <Badge bg={assignment.isPrimary?"primary":"secondary"}>{assignment.isPrimary?"Primary":"Additional"}</Badge>
               </td>
               <td>
                <Badge bg={assignment.isActive?"success":"secondary"}>{assignment.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openAssignmentForm(assignment)}>
                  <Edit size={14}/>
                 </Button>
                 <Button type="button" variant="outline-danger" onClick={()=>deleteAssignment(getId(assignment))}>
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
       <Row className="g-4 mt-1">
        <Col xs={12}>
         <Card className="shadow-sm">
          <Card.Header className="d-flex align-items-center gap-2">
           <Shield size={18}/>
           <span>Role Permissions</span>
          </Card.Header>

          <Card.Body>
           <Row className="g-3 mb-4">
            <Col md={6} lg={4}>
             <Form.Group>
              <Form.Label>Business</Form.Label>
              <Form.Select value={selectedBusiness} onChange={e=>setSelectedBusiness(e.target.value)} disabled={loadingBusinesses||loadingCurrentBusiness}>
               <option value="">Select business</option>
               {businesses.map(b=>(
                <option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>
               ))}
              </Form.Select>
             </Form.Group>
            </Col>

            <Col md={6} lg={4}>
             <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={selectedPermissionRole} onChange={e=>setSelectedPermissionRole(e.target.value)} disabled={!selectedBusiness||loadingRoles}>
               <option value="">Select role</option>
               {roleOptions.map(role=>(
                <option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>
               ))}
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Card className="mb-4 border">
            <Card.Header>Add Module Permission</Card.Header>
            <Card.Body>
             <Form onSubmit={createPermissionRow}>
              <Row className="g-3 align-items-end">
               <Col lg={4}>
                <Form.Group>
                 <Form.Label>Module</Form.Label>
                 <Form.Select name="module" value={newModuleForm.module} onChange={handleNewModuleChange} required disabled={loadingModules}>
                  <option value="">Select module</option>
                  {normalizedModuleOptions.map(module=>(
                   <option key={module.value} value={module.value}>{module.label}</option>
                  ))}
                 </Form.Select>
                </Form.Group>
               </Col>

               <Col sm={6} md={4} lg={1}>
                <Form.Check type="checkbox" id="newCreate" name="create" label="C" checked={newModuleForm.create} onChange={handleNewModuleChange}/>
               </Col>

               <Col sm={6} md={4} lg={1}>
                <Form.Check type="checkbox" id="newRead" name="read" label="R" checked={newModuleForm.read} onChange={handleNewModuleChange}/>
               </Col>

               <Col sm={6} md={4} lg={1}>
                <Form.Check type="checkbox" id="newUpdate" name="update" label="U" checked={newModuleForm.update} onChange={handleNewModuleChange}/>
               </Col>

               <Col sm={6} md={4} lg={1}>
                <Form.Check type="checkbox" id="newDelete" name="delete" label="D" checked={newModuleForm.delete} onChange={handleNewModuleChange}/>
               </Col>

               <Col sm={6} md={4} lg={1}>
                <Form.Check type="checkbox" id="newAdmin" name="admin" label="A" checked={newModuleForm.admin} onChange={handleNewModuleChange}/>
               </Col>

               <Col lg={3}>
                <Button type="submit" disabled={savingNewPermission||!selectedBusiness||!selectedPermissionRole||loadingModules} className="w-100">
                 {savingNewPermission?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
                 <span className="ms-2">Add Permission</span>
                </Button>
               </Col>
              </Row>
             </Form>
            </Card.Body>
           </Card>

           <div className="table-responsive">
            <Table responsive hover className="mb-0 align-middle">
             <thead>
              <tr>
               <th>Module</th>
               <th>Create</th>
               <th>Read</th>
               <th>Update</th>
               <th>Delete</th>
               <th>Admin</th>
               <th className="text-end">Actions</th>
              </tr>
             </thead>

             <tbody>
              {!selectedPermissionRole?(
               <tr>
                <td colSpan="7" className="text-center py-4 text-muted">Select a role to manage permissions.</td>
               </tr>
              ):null}

              {selectedPermissionRole&&!loadingPermissions&&selectedRolePermissions.length===0?(
               <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No permissions found for this role.</td>
               </tr>
              ):null}

              {selectedRolePermissions.map(permission=>(
               <PermissionRow key={getId(permission)} permission={permission}/>
              ))}
             </tbody>
            </Table>
           </div>
          </Card.Body>
         </Card>
        </Col>
       </Row>
      </Tab>
     </Tabs>
    </Col>
   </Row>
  </div>
 );
}