// frontend/src/pages/admin/BusinessRolesPermissionsPage.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Row,Spinner,Table,Tabs,Tab} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Save,Shield,Trash2,UserCog,Building2} from "lucide-react";

const defaultBusinessId="";

const emptyRoleForm={
 business:"",
 name:"",
 label:"",
 description:"",
 rank:100,
 isSystem:false,
 isDefault:false,
 isActive:true
};

const emptyDepartmentForm={
 business:"",
 name:"",
 code:"",
 accountingCode:"",
 description:"",
 defaultRole:"",
 isSystem:false,
 isDefault:false,
 isActive:true
};

const emptyBusinessAssignmentForm={
 user:"",
 business:"",
 role:"",
 isPrimary:true,
 isActive:true
};

const emptyDepartmentAssignmentForm={
 user:"",
 business:"",
 department:"",
 roleOverride:"",
 isPrimary:false,
 isActive:true
};

const emptyRolePermissionForm={
 module:"",
 create:false,
 read:true,
 update:false,
 delete:false,
 admin:false
};

const emptyUserOverrideForm={
 user:"",
 business:"",
 department:"",
 module:"",
 create:"",
 read:"",
 update:"",
 delete:"",
 admin:"",
 isActive:true
};

const emptyModuleForm={
 appKey:"",
 key:"",
 label:"",
 path:"",
 group:"General",
 description:"",
 sortOrder:0,
 isSystem:false,
 isActive:true
};

export default function BusinessRolesPermissionsPage(){
 const [businesses,setBusinesses]=useState([]);
 const [businessTypes,setBusinessTypes]=useState([]);
 const [selectedBusiness,setSelectedBusiness]=useState(defaultBusinessId);
 const [currentAppBusinessId,setCurrentAppBusinessId]=useState(defaultBusinessId);

 const [roles,setRoles]=useState([]);
 const [departments,setDepartments]=useState([]);
 const [users,setUsers]=useState([]);
 const [businessAssignments,setBusinessAssignments]=useState([]);
 const [departmentAssignments,setDepartmentAssignments]=useState([]);
 const [rolePermissions,setRolePermissions]=useState([]);
 const [userOverrides,setUserOverrides]=useState([]);
 const [moduleOptions,setModuleOptions]=useState([]);

 const [loadingBusinesses,setLoadingBusinesses]=useState(false);
 const [loadingBusinessTypes,setLoadingBusinessTypes]=useState(false);
 const [loadingCurrentBusiness,setLoadingCurrentBusiness]=useState(false);
 const [loadingRoles,setLoadingRoles]=useState(false);
 const [loadingDepartments,setLoadingDepartments]=useState(false);
 const [loadingUsers,setLoadingUsers]=useState(false);
 const [loadingBusinessAssignments,setLoadingBusinessAssignments]=useState(false);
 const [loadingDepartmentAssignments,setLoadingDepartmentAssignments]=useState(false);
 const [loadingRolePermissions,setLoadingRolePermissions]=useState(false);
 const [loadingUserOverrides,setLoadingUserOverrides]=useState(false);
 const [loadingModules,setLoadingModules]=useState(false);

 const [savingRole,setSavingRole]=useState(false);
 const [savingDepartment,setSavingDepartment]=useState(false);
 const [savingBusinessAssignment,setSavingBusinessAssignment]=useState(false);
 const [savingDepartmentAssignment,setSavingDepartmentAssignment]=useState(false);
 const [savingRolePermission,setSavingRolePermission]=useState(false);
 const [savingUserOverride,setSavingUserOverride]=useState(false);
 const [savingModule,setSavingModule]=useState(false);
 const [savingPermissionById,setSavingPermissionById]=useState({});

 const [roleForm,setRoleForm]=useState({...emptyRoleForm,business:defaultBusinessId});
 const [departmentForm,setDepartmentForm]=useState({...emptyDepartmentForm,business:defaultBusinessId});
 const [businessAssignmentForm,setBusinessAssignmentForm]=useState({...emptyBusinessAssignmentForm,business:defaultBusinessId});
 const [departmentAssignmentForm,setDepartmentAssignmentForm]=useState({...emptyDepartmentAssignmentForm,business:defaultBusinessId});
 const [rolePermissionForm,setRolePermissionForm]=useState(emptyRolePermissionForm);
 const [userOverrideForm,setUserOverrideForm]=useState({...emptyUserOverrideForm,business:defaultBusinessId});
 const [moduleForm,setModuleForm]=useState({...emptyModuleForm});

 const [editingRoleId,setEditingRoleId]=useState("");
 const [editingDepartmentId,setEditingDepartmentId]=useState("");
 const [editingBusinessAssignmentId,setEditingBusinessAssignmentId]=useState("");
 const [editingDepartmentAssignmentId,setEditingDepartmentAssignmentId]=useState("");
 const [editingUserOverrideId,setEditingUserOverrideId]=useState("");
 const [editingModuleId,setEditingModuleId]=useState("");

 const [selectedPermissionRole,setSelectedPermissionRole]=useState("");
 const [activeTab,setActiveTab]=useState("roles");
 const [message,setMessage]=useState({type:"",text:""});

 const roleFormRef=useRef(null);
 const roleNameRef=useRef(null);
 const departmentFormRef=useRef(null);
 const departmentNameRef=useRef(null);
 const businessAssignmentFormRef=useRef(null);
 const departmentAssignmentFormRef=useRef(null);
 const userOverrideFormRef=useRef(null);
 const moduleFormRef=useRef(null);

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

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
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
  if(!role)return "";
  if(typeof role==="string")return role;
  return String(role.label||role.name||"").trim();
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
  const detailName=[user?.details?.firstName,user?.details?.lastName].filter(Boolean).join(" ").trim();
  const label=detailName||username||email||"Unnamed user";

  return `${label}${email&&email!==label?` (${email})`:""}`;
 };

 const getModuleLabel=moduleKey=>{
  const match=moduleOptions.find(module=>String(module.key||module.value||module.module||"")===String(moduleKey));
  return match?.label||match?.name||moduleKey||"";
 };

 const getOverrideValue=value=>{
  if(value===true)return "allow";
  if(value===false)return "deny";
  return "inherit";
 };

 const parseOverrideValue=value=>{
  if(value==="allow")return true;
  if(value==="deny")return false;
  return null;
 };

 const getAssignmentRoleLabel=assignment=>{
  const role=assignment?.roleOverride||assignment?.department?.defaultRole||null;
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

   const rankA=Number(a.rank||100);
   const rankB=Number(b.rank||100);

   if(rankA!==rankB)return rankA-rankB;

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

  return rolePermissions
   .filter(permission=>String(getId(permission.role))===String(selectedPermissionRole))
   .sort((a,b)=>(a.module||"").localeCompare(b.module||""));
 },[rolePermissions,selectedPermissionRole]);

 useEffect(()=>{
  const init=async()=>{
   const currentBusinessId=await loadCurrentAppBusiness();
   await fetchBusinesses(currentBusinessId);
   await fetchBusinessTypes();
   await fetchModules();
  };

  init();
 },[]);

 useEffect(()=>{
  if(!selectedBusiness){
   setRoles([]);
   setDepartments([]);
   setUsers([]);
   setBusinessAssignments([]);
   setDepartmentAssignments([]);
   setRolePermissions([]);
   setUserOverrides([]);
   setRoleForm(prev=>({...prev,business:""}));
   setDepartmentForm(prev=>({...prev,business:""}));
   setBusinessAssignmentForm(prev=>({...prev,business:""}));
   setDepartmentAssignmentForm(prev=>({...prev,business:""}));
   setUserOverrideForm(prev=>({...prev,business:""}));
   setSelectedPermissionRole("");
   return;
  }

  const businessId=String(selectedBusiness);

  setRoleForm(prev=>({...prev,business:businessId}));
  setDepartmentForm(prev=>({...prev,business:businessId}));
  setBusinessAssignmentForm(prev=>({...prev,business:businessId}));
  setDepartmentAssignmentForm(prev=>({...prev,business:businessId}));
  setUserOverrideForm(prev=>({...prev,business:businessId}));

  fetchRoles(businessId);
  fetchDepartments(businessId);
  fetchUsers(businessId);
  fetchBusinessAssignments(businessId);
  fetchDepartmentAssignments(businessId);
  fetchRolePermissions(businessId);
  fetchUserOverrides(businessId);
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
   setModuleForm(prev=>({...prev,appKey:""}));
   setMessage({type:"danger",text:"App key is missing. Add meta app-key or VITE_APP_KEY."});
   return;
  }

  try{
   setLoadingModules(true);

   const res=await api(`/api/users/permission-modules?appKey=${encodeURIComponent(appKey)}&isActive=true`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setModuleOptions(list);
   setModuleForm(prev=>({...prev,appKey}));
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

 const fetchUsers=async businessId=>{
  try{
   setLoadingUsers(true);

   const targetBusiness=businessId||selectedBusiness;
   const res=await api(`/api/users?business=${encodeURIComponent(String(targetBusiness))}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setUsers(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load users"});
  }finally{
   setLoadingUsers(false);
  }
 };

 const fetchBusinessAssignments=async businessId=>{
  try{
   setLoadingBusinessAssignments(true);

   const res=await api(`/api/users/role-assignments?business=${encodeURIComponent(String(businessId))}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setBusinessAssignments(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load business role assignments"});
  }finally{
   setLoadingBusinessAssignments(false);
  }
 };

 const fetchDepartmentAssignments=async businessId=>{
  try{
   setLoadingDepartmentAssignments(true);

   const res=await api(`/api/users/department-assignments?business=${encodeURIComponent(String(businessId))}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setDepartmentAssignments(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load department assignments"});
  }finally{
   setLoadingDepartmentAssignments(false);
  }
 };

 const fetchRolePermissions=async businessId=>{
  try{
   setLoadingRolePermissions(true);

   const res=await api(`/api/users/role-permissions?business=${encodeURIComponent(String(businessId))}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setRolePermissions(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load role permissions"});
  }finally{
   setLoadingRolePermissions(false);
  }
 };

 const fetchUserOverrides=async businessId=>{
  try{
   setLoadingUserOverrides(true);

   const res=await api(`/api/users/user-permission-overrides?business=${encodeURIComponent(String(businessId))}`);
   const list=Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[];

   setUserOverrides(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load user permission overrides"});
  }finally{
   setLoadingUserOverrides(false);
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

 const resetBusinessAssignmentForm=()=>{
  setBusinessAssignmentForm({...emptyBusinessAssignmentForm,business:selectedBusiness,isPrimary:true,isActive:true});
  setEditingBusinessAssignmentId("");
  setMessage({type:"",text:""});
 };

 const resetDepartmentAssignmentForm=()=>{
  setDepartmentAssignmentForm({...emptyDepartmentAssignmentForm,business:selectedBusiness,isActive:true});
  setEditingDepartmentAssignmentId("");
  setMessage({type:"",text:""});
 };

 const resetRolePermissionForm=()=>{
  setRolePermissionForm(emptyRolePermissionForm);
  setMessage({type:"",text:""});
 };

 const resetUserOverrideForm=()=>{
  setUserOverrideForm({...emptyUserOverrideForm,business:selectedBusiness,isActive:true});
  setEditingUserOverrideId("");
  setMessage({type:"",text:""});
 };

 const resetModuleForm=()=>{
  setModuleForm({...emptyModuleForm,appKey:getRuntimeAppKey()});
  setEditingModuleId("");
  setMessage({type:"",text:""});
 };

 const handleRoleChange=e=>{
  const {name,value,type,checked}=e.target;
  setRoleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleDepartmentChange=e=>{
  const {name,value,type,checked}=e.target;
  setDepartmentForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleBusinessAssignmentChange=e=>{
  const {name,value,type,checked}=e.target;
  setBusinessAssignmentForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleDepartmentAssignmentChange=e=>{
  const {name,value,type,checked}=e.target;
  setDepartmentAssignmentForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleRolePermissionChange=e=>{
  const {name,value,type,checked}=e.target;

  if(type==="checkbox"&&name==="admin"){
   if(checked){
    setRolePermissionForm(prev=>({
     ...prev,
     create:true,
     read:true,
     update:true,
     delete:true,
     admin:true
    }));
    return;
   }

   setRolePermissionForm(prev=>({
    ...prev,
    create:false,
    read:false,
    update:false,
    delete:false,
    admin:false
   }));
   return;
  }

  setRolePermissionForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleUserOverrideChange=e=>{
  const {name,value,type,checked}=e.target;
  setUserOverrideForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleModuleChange=e=>{
  const {name,value,type,checked}=e.target;
  setModuleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const openRoleForm=role=>{
  setActiveTab("roles");
  setEditingRoleId(getId(role));

  setRoleForm({
   business:selectedBusiness,
   name:role.name||"",
   label:role.label||"",
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
  setActiveTab("departments");
  setEditingDepartmentId(getId(department));

  setDepartmentForm({
   business:selectedBusiness,
   name:department.name||"",
   code:department.code||"",
   accountingCode:department.accountingCode||"",
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

 const openBusinessAssignmentForm=assignment=>{
  setActiveTab("businessAssignments");
  setEditingBusinessAssignmentId(getId(assignment));

  setBusinessAssignmentForm({
   user:getId(assignment.user),
   business:selectedBusiness,
   role:getId(assignment.role),
   isPrimary:!!assignment.isPrimary,
   isActive:assignment.isActive!==false
  });

  setMessage({type:"info",text:`Editing business role assignment: ${getUserLabel(assignment.user)}`});

  setTimeout(()=>{
   businessAssignmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const openDepartmentAssignmentForm=assignment=>{
  setActiveTab("departmentAssignments");
  setEditingDepartmentAssignmentId(getId(assignment));

  setDepartmentAssignmentForm({
   user:getId(assignment.user),
   business:selectedBusiness,
   department:getId(assignment.department),
   roleOverride:getId(assignment.roleOverride),
   isPrimary:!!assignment.isPrimary,
   isActive:assignment.isActive!==false
  });

  setMessage({type:"info",text:`Editing department assignment: ${getUserLabel(assignment.user)}`});

  setTimeout(()=>{
   departmentAssignmentFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const openUserOverrideForm=override=>{
  setActiveTab("userOverrides");
  setEditingUserOverrideId(getId(override));

  setUserOverrideForm({
   user:getId(override.user),
   business:selectedBusiness,
   department:getId(override.department),
   module:override.module||"",
   create:getOverrideValue(override.create),
   read:getOverrideValue(override.read),
   update:getOverrideValue(override.update),
   delete:getOverrideValue(override.delete),
   admin:getOverrideValue(override.admin),
   isActive:override.isActive!==false
  });

  setMessage({type:"info",text:`Editing override: ${getUserLabel(override.user)}`});

  setTimeout(()=>{
   userOverrideFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const openModuleForm=module=>{
  setActiveTab("modules");
  setEditingModuleId(getId(module));

  setModuleForm({
   appKey:module.appKey||getRuntimeAppKey(),
   key:module.key||"",
   label:module.label||"",
   path:module.path||"",
   group:module.group||"General",
   description:module.description||"",
   sortOrder:module.sortOrder??0,
   isSystem:!!module.isSystem,
   isActive:module.isActive!==false
  });

  setMessage({type:"info",text:`Editing module: ${module.label||module.key||"selected module"}`});

  setTimeout(()=>{
   moduleFormRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  },0);
 };

 const submitRole=async e=>{
  e.preventDefault();

  if(!roleForm.business||!roleForm.name.trim()){
   setMessage({type:"danger",text:"Business and role name are required"});
   return;
  }

  const isEditing=!!editingRoleId;

  try{
   setSavingRole(true);
   setMessage({type:"",text:""});

   const payload={
    business:roleForm.business,
    name:roleForm.name.trim().toLowerCase(),
    label:roleForm.label.trim(),
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
   await fetchBusinessAssignments(roleForm.business);
   await fetchRolePermissions(roleForm.business);
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

  if(!departmentForm.business||!departmentForm.name.trim()||!departmentForm.code.trim()){
   setMessage({type:"danger",text:"Business, department name, and department code are required"});
   return;
  }

  const isEditing=!!editingDepartmentId;

  try{
   setSavingDepartment(true);
   setMessage({type:"",text:""});

   const payload={
    business:departmentForm.business,
    name:departmentForm.name.trim(),
    code:departmentForm.code.trim().toUpperCase(),
    accountingCode:departmentForm.accountingCode.trim().toUpperCase(),
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
   await fetchDepartmentAssignments(departmentForm.business);
   resetDepartmentForm();
   setMessage({type:"success",text:isEditing?"Department updated":"Department created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save department"});
  }finally{
   setSavingDepartment(false);
  }
 };

 const submitBusinessAssignment=async e=>{
  e.preventDefault();

  if(!businessAssignmentForm.user||!businessAssignmentForm.business||!businessAssignmentForm.role){
   setMessage({type:"danger",text:"User, business, and role are required"});
   return;
  }

  const isEditing=!!editingBusinessAssignmentId;

  try{
   setSavingBusinessAssignment(true);
   setMessage({type:"",text:""});

   const payload={
    user:businessAssignmentForm.user,
    business:businessAssignmentForm.business,
    role:businessAssignmentForm.role,
    isPrimary:!!businessAssignmentForm.isPrimary,
    isActive:!!businessAssignmentForm.isActive
   };

   if(isEditing)
    await api(`/api/users/role-assignments/${editingBusinessAssignmentId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/role-assignments",{method:"POST",body:JSON.stringify(payload)});

   await fetchBusinessAssignments(businessAssignmentForm.business);
   await fetchUsers(businessAssignmentForm.business);
   resetBusinessAssignmentForm();
   setMessage({type:"success",text:isEditing?"Business role assignment updated":"Business role assignment created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save business role assignment"});
  }finally{
   setSavingBusinessAssignment(false);
  }
 };

 const submitDepartmentAssignment=async e=>{
  e.preventDefault();

  if(!departmentAssignmentForm.user||!departmentAssignmentForm.business||!departmentAssignmentForm.department){
   setMessage({type:"danger",text:"User, business, and department are required"});
   return;
  }

  const isEditing=!!editingDepartmentAssignmentId;

  try{
   setSavingDepartmentAssignment(true);
   setMessage({type:"",text:""});

   const payload={
    user:departmentAssignmentForm.user,
    business:departmentAssignmentForm.business,
    department:departmentAssignmentForm.department,
    roleOverride:departmentAssignmentForm.roleOverride||null,
    isPrimary:!!departmentAssignmentForm.isPrimary,
    isActive:!!departmentAssignmentForm.isActive
   };

   if(isEditing)
    await api(`/api/users/department-assignments/${editingDepartmentAssignmentId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/department-assignments",{method:"POST",body:JSON.stringify(payload)});

   await fetchDepartmentAssignments(departmentAssignmentForm.business);
   await fetchUsers(departmentAssignmentForm.business);
   resetDepartmentAssignmentForm();
   setMessage({type:"success",text:isEditing?"Department assignment updated":"Department assignment created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save department assignment"});
  }finally{
   setSavingDepartmentAssignment(false);
  }
 };

 const submitRolePermission=async e=>{
  e.preventDefault();

  if(!selectedBusiness||!selectedPermissionRole||!rolePermissionForm.module){
   setMessage({type:"danger",text:"Business, role, and module are required"});
   return;
  }

  const moduleName=rolePermissionForm.module.trim().toLowerCase();
  const exists=selectedRolePermissions.some(permission=>permission.module===moduleName);

  if(exists){
   setMessage({type:"danger",text:"That module already exists for the selected role"});
   return;
  }

  try{
   setSavingRolePermission(true);
   setMessage({type:"",text:""});

   const payload={
    business:selectedBusiness,
    role:selectedPermissionRole,
    module:moduleName,
    create:!!rolePermissionForm.create,
    read:!!rolePermissionForm.read,
    update:!!rolePermissionForm.update,
    delete:!!rolePermissionForm.delete,
    admin:!!rolePermissionForm.admin
   };

   await api("/api/users/role-permissions",{method:"POST",body:JSON.stringify(payload)});

   await fetchRolePermissions(selectedBusiness);
   resetRolePermissionForm();
   setMessage({type:"success",text:"Role permission added"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to add role permission"});
  }finally{
   setSavingRolePermission(false);
  }
 };

 const submitUserOverride=async e=>{
  e.preventDefault();

  if(!userOverrideForm.user||!userOverrideForm.business||!userOverrideForm.module){
   setMessage({type:"danger",text:"User, business, and module are required"});
   return;
  }

  const isEditing=!!editingUserOverrideId;

  try{
   setSavingUserOverride(true);
   setMessage({type:"",text:""});

   const payload={
    user:userOverrideForm.user,
    business:userOverrideForm.business,
    department:userOverrideForm.department||null,
    module:userOverrideForm.module.trim().toLowerCase(),
    create:parseOverrideValue(userOverrideForm.create),
    read:parseOverrideValue(userOverrideForm.read),
    update:parseOverrideValue(userOverrideForm.update),
    delete:parseOverrideValue(userOverrideForm.delete),
    admin:parseOverrideValue(userOverrideForm.admin),
    isActive:!!userOverrideForm.isActive
   };

   if(isEditing)
    await api(`/api/users/user-permission-overrides/${editingUserOverrideId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/user-permission-overrides",{method:"POST",body:JSON.stringify(payload)});

   await fetchUserOverrides(userOverrideForm.business);
   resetUserOverrideForm();
   setMessage({type:"success",text:isEditing?"User override updated":"User override created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save user override"});
  }finally{
   setSavingUserOverride(false);
  }
 };

 const submitModule=async e=>{
  e.preventDefault();

  if(!moduleForm.appKey||!moduleForm.key.trim()||!moduleForm.label.trim()){
   setMessage({type:"danger",text:"App key, module key, and label are required"});
   return;
  }

  const isEditing=!!editingModuleId;

  try{
   setSavingModule(true);
   setMessage({type:"",text:""});

   const payload={
    appKey:moduleForm.appKey.trim().toLowerCase(),
    key:moduleForm.key.trim().toLowerCase(),
    label:moduleForm.label.trim(),
    path:moduleForm.path.trim(),
    group:moduleForm.group.trim()||"General",
    description:moduleForm.description.trim(),
    sortOrder:Number(moduleForm.sortOrder)||0,
    isSystem:!!moduleForm.isSystem,
    isActive:!!moduleForm.isActive
   };

   if(isEditing)
    await api(`/api/users/permission-modules/${editingModuleId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/users/permission-modules",{method:"POST",body:JSON.stringify(payload)});

   await fetchModules();
   resetModuleForm();
   setMessage({type:"success",text:isEditing?"Permission module updated":"Permission module created"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save permission module"});
  }finally{
   setSavingModule(false);
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

   await fetchRolePermissions(selectedBusiness);
   setMessage({type:"success",text:"Role permission updated"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to update role permission"});
  }finally{
   setSavingPermissionById(prev=>({...prev,[permissionId]:false}));
  }
 };

 const deleteRecord=async({url,messageText,afterDelete})=>{
  if(!window.confirm(messageText))return;

  try{
   setMessage({type:"",text:""});
   await api(url,{method:"DELETE"});
   await afterDelete();
   setMessage({type:"success",text:"Deleted successfully"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Delete failed"});
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
      <Button
       variant="outline-danger"
       onClick={()=>deleteRecord({
        url:`/api/users/role-permissions/${getId(permission)}`,
        messageText:"Delete this role permission?",
        afterDelete:()=>fetchRolePermissions(selectedBusiness)
       })}
      >
       <Trash2 size={14}/>
      </Button>
     </ButtonGroup>
    </td>
   </tr>
  );
 };

 const OverrideSelect=({name,value,onChange})=>(
  <Form.Select name={name} value={value} onChange={onChange}>
   <option value="">Inherit</option>
   <option value="allow">Allow</option>
   <option value="deny">Deny</option>
  </Form.Select>
 );

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
          <h3 className="mb-0">Business Security System</h3>
         </div>
         <div className="text-muted">
          Manage roles, departments, business assignments, department assignments, role permissions, user overrides, and app modules.
         </div>
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
     <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"roles")} className="mb-3">
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
                {businesses.map(b=><option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>)}
               </Form.Select>
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

             <Col xs={12}><Form.Check type="switch" id="roleIsSystem" name="isSystem" label="System role" checked={roleForm.isSystem} onChange={handleRoleChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="roleIsDefault" name="isDefault" label="Default role" checked={roleForm.isDefault} onChange={handleRoleChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="roleIsActive" name="isActive" label="Active" checked={roleForm.isActive} onChange={handleRoleChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingRole||!roleForm.business}>
               {savingRole?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingRoleId?"Update Role":"Add Role"}</span>
              </Button>
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
              <th>Type</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {!loadingRoles&&roleOptions.length===0?<tr><td colSpan="6" className="text-center py-4 text-muted">No roles found.</td></tr>:null}

             {roleOptions.map(role=>(
              <tr key={getId(role)}>
               <td>{role.name}</td>
               <td>{role.label||"-"}</td>
               <td>{role.rank??"-"}</td>
               <td><Badge bg={role.isSystem?"dark":role.isDefault?"primary":"secondary"}>{role.isSystem?"System":role.isDefault?"Default":"Custom"}</Badge></td>
               <td><Badge bg={role.isActive!==false?"success":"secondary"}>{role.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openRoleForm(role)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/roles/${getId(role)}`,
                   messageText:"Delete this role?",
                   afterDelete:async()=>{
                    await fetchRoles(selectedBusiness);
                    await fetchBusinessAssignments(selectedBusiness);
                    await fetchRolePermissions(selectedBusiness);
                   }
                  })}
                 >
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
                {businesses.map(b=><option key={getId(b)} value={getId(b)}>{getBusinessLabel(b)}</option>)}
               </Form.Select>
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
                {roleOptions.map(role=><option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={4} name="description" value={departmentForm.description} onChange={handleDepartmentChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}><Form.Check type="switch" id="departmentIsSystem" name="isSystem" label="System department" checked={departmentForm.isSystem} onChange={handleDepartmentChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="departmentIsDefault" name="isDefault" label="Default department" checked={departmentForm.isDefault} onChange={handleDepartmentChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="departmentIsActive" name="isActive" label="Active" checked={departmentForm.isActive} onChange={handleDepartmentChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingDepartment||!departmentForm.business}>
               {savingDepartment?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingDepartmentId?"Update Department":"Add Department"}</span>
              </Button>
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
              <th>Accounting</th>
              <th>Default Role</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {!loadingDepartments&&departmentOptions.length===0?<tr><td colSpan="7" className="text-center py-4 text-muted">No departments found.</td></tr>:null}

             {departmentOptions.map(department=>(
              <tr key={getId(department)}>
               <td>{department.name}</td>
               <td>{department.code||"-"}</td>
               <td>{department.accountingCode||"-"}</td>
               <td>{getRoleDisplayName(department.defaultRole)||"-"}</td>
               <td><Badge bg={department.isSystem?"dark":department.isDefault?"primary":"secondary"}>{department.isSystem?"System":department.isDefault?"Default":"Custom"}</Badge></td>
               <td><Badge bg={department.isActive!==false?"success":"secondary"}>{department.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openDepartmentForm(department)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/business-departments/${getId(department)}`,
                   messageText:"Delete this department?",
                   afterDelete:async()=>{
                    await fetchDepartments(selectedBusiness);
                    await fetchDepartmentAssignments(selectedBusiness);
                   }
                  })}
                 >
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

      <Tab eventKey="businessAssignments" title="Business Role Assignments" disabled={!selectedBusiness}>
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={businessAssignmentFormRef}>
          <Card.Header className="d-flex align-items-center gap-2">
           <UserCog size={18}/>
           <span>{editingBusinessAssignmentId?"Edit Business Role Assignment":"Assign Business Role"}</span>
          </Card.Header>

          <Card.Body>
           <Form onSubmit={submitBusinessAssignment}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>User</Form.Label>
               <Form.Select name="user" value={businessAssignmentForm.user} onChange={handleBusinessAssignmentChange} required disabled={loadingUsers}>
                <option value="">Select user</option>
                {users.map(user=><option key={getId(user)} value={getId(user)}>{getUserLabel(user)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Business Role</Form.Label>
               <Form.Select name="role" value={businessAssignmentForm.role} onChange={handleBusinessAssignmentChange} required disabled={loadingRoles}>
                <option value="">Select role</option>
                {roleOptions.map(role=><option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}><Form.Check type="switch" id="businessAssignmentPrimary" name="isPrimary" label="Primary business role" checked={businessAssignmentForm.isPrimary} onChange={handleBusinessAssignmentChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="businessAssignmentActive" name="isActive" label="Active" checked={businessAssignmentForm.isActive} onChange={handleBusinessAssignmentChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingBusinessAssignment||!businessAssignmentForm.user||!businessAssignmentForm.role}>
               {savingBusinessAssignment?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingBusinessAssignmentId?"Update Assignment":"Assign Role"}</span>
              </Button>
              <Button type="button" variant="outline-secondary" onClick={resetBusinessAssignmentForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>Business Role Assignments</span>
           {loadingBusinessAssignments?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>User</th>
              <th>Role</th>
              <th>Primary</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {!loadingBusinessAssignments&&businessAssignments.length===0?<tr><td colSpan="5" className="text-center py-4 text-muted">No business role assignments found.</td></tr>:null}

             {businessAssignments.map(assignment=>(
              <tr key={getId(assignment)}>
               <td>{getUserLabel(assignment.user)}</td>
               <td>{getRoleDisplayName(assignment.role)||"-"}</td>
               <td><Badge bg={assignment.isPrimary?"primary":"secondary"}>{assignment.isPrimary?"Primary":"No"}</Badge></td>
               <td><Badge bg={assignment.isActive!==false?"success":"secondary"}>{assignment.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openBusinessAssignmentForm(assignment)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/role-assignments/${getId(assignment)}`,
                   messageText:"Delete this business role assignment?",
                   afterDelete:()=>fetchBusinessAssignments(selectedBusiness)
                  })}
                 >
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

      <Tab eventKey="departmentAssignments" title="Department Assignments" disabled={!selectedBusiness}>
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={departmentAssignmentFormRef}>
          <Card.Header className="d-flex align-items-center gap-2">
           <UserCog size={18}/>
           <span>{editingDepartmentAssignmentId?"Edit Department Assignment":"Assign Department"}</span>
          </Card.Header>

          <Card.Body>
           <Form onSubmit={submitDepartmentAssignment}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>User</Form.Label>
               <Form.Select name="user" value={departmentAssignmentForm.user} onChange={handleDepartmentAssignmentChange} required disabled={loadingUsers}>
                <option value="">Select user</option>
                {users.map(user=><option key={getId(user)} value={getId(user)}>{getUserLabel(user)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department</Form.Label>
               <Form.Select name="department" value={departmentAssignmentForm.department} onChange={handleDepartmentAssignmentChange} required disabled={loadingDepartments}>
                <option value="">Select department</option>
                {departmentOptions.map(department=><option key={getId(department)} value={getId(department)}>{getDepartmentLabel(department)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Role Override</Form.Label>
               <Form.Select name="roleOverride" value={departmentAssignmentForm.roleOverride} onChange={handleDepartmentAssignmentChange}>
                <option value="">Use department default role</option>
                {roleOptions.map(role=><option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}><Form.Check type="switch" id="departmentAssignmentPrimary" name="isPrimary" label="Primary department" checked={departmentAssignmentForm.isPrimary} onChange={handleDepartmentAssignmentChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="departmentAssignmentActive" name="isActive" label="Active" checked={departmentAssignmentForm.isActive} onChange={handleDepartmentAssignmentChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingDepartmentAssignment||!departmentAssignmentForm.user||!departmentAssignmentForm.department}>
               {savingDepartmentAssignment?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingDepartmentAssignmentId?"Update Assignment":"Assign Department"}</span>
              </Button>
              <Button type="button" variant="outline-secondary" onClick={resetDepartmentAssignmentForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>Department Assignments</span>
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
             {!loadingDepartmentAssignments&&departmentAssignments.length===0?<tr><td colSpan="6" className="text-center py-4 text-muted">No department assignments found.</td></tr>:null}

             {departmentAssignments.map(assignment=>(
              <tr key={getId(assignment)}>
               <td>{getUserLabel(assignment.user)}</td>
               <td>{assignment.department?.name||"-"}</td>
               <td>{getAssignmentRoleLabel(assignment)}</td>
               <td><Badge bg={assignment.isPrimary?"primary":"secondary"}>{assignment.isPrimary?"Primary":"Additional"}</Badge></td>
               <td><Badge bg={assignment.isActive!==false?"success":"secondary"}>{assignment.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openDepartmentAssignmentForm(assignment)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/department-assignments/${getId(assignment)}`,
                   messageText:"Delete this department assignment?",
                   afterDelete:()=>fetchDepartmentAssignments(selectedBusiness)
                  })}
                 >
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

      <Tab eventKey="rolePermissions" title="Role Permissions" disabled={!selectedBusiness}>
       <Row className="g-4 mt-1">
        <Col xs={12}>
         <Card className="shadow-sm">
          <Card.Header className="d-flex align-items-center gap-2">
           <Shield size={18}/>
           <span>Role Permissions</span>
           {loadingRolePermissions?<Spinner size="sm" animation="border" className="ms-auto"/>:null}
          </Card.Header>

          <Card.Body>
           <Row className="g-3 mb-4">
            <Col md={6} lg={4}>
             <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={selectedPermissionRole} onChange={e=>setSelectedPermissionRole(e.target.value)} disabled={!selectedBusiness||loadingRoles}>
               <option value="">Select role</option>
               {roleOptions.map(role=><option key={getId(role)} value={getId(role)}>{getRoleLabel(role)}</option>)}
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Card className="mb-4 border">
            <Card.Header>Add Role Permission</Card.Header>
            <Card.Body>
             <Form onSubmit={submitRolePermission}>
              <Row className="g-3 align-items-end">
               <Col lg={4}>
                <Form.Group>
                 <Form.Label>Module</Form.Label>
                 <Form.Select name="module" value={rolePermissionForm.module} onChange={handleRolePermissionChange} required disabled={loadingModules}>
                  <option value="">Select module</option>
                  {normalizedModuleOptions.map(module=><option key={module.value} value={module.value}>{module.label}</option>)}
                 </Form.Select>
                </Form.Group>
               </Col>

               <Col sm={6} md={4} lg={1}><Form.Check type="checkbox" id="roleCreate" name="create" label="C" checked={rolePermissionForm.create} onChange={handleRolePermissionChange}/></Col>
               <Col sm={6} md={4} lg={1}><Form.Check type="checkbox" id="roleRead" name="read" label="R" checked={rolePermissionForm.read} onChange={handleRolePermissionChange}/></Col>
               <Col sm={6} md={4} lg={1}><Form.Check type="checkbox" id="roleUpdate" name="update" label="U" checked={rolePermissionForm.update} onChange={handleRolePermissionChange}/></Col>
               <Col sm={6} md={4} lg={1}><Form.Check type="checkbox" id="roleDelete" name="delete" label="D" checked={rolePermissionForm.delete} onChange={handleRolePermissionChange}/></Col>
               <Col sm={6} md={4} lg={1}><Form.Check type="checkbox" id="roleAdmin" name="admin" label="A" checked={rolePermissionForm.admin} onChange={handleRolePermissionChange}/></Col>

               <Col lg={3}>
                <Button type="submit" disabled={savingRolePermission||!selectedPermissionRole||loadingModules} className="w-100">
                 {savingRolePermission?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
                 <span className="ms-2">Add Permission</span>
                </Button>
               </Col>
              </Row>
             </Form>
            </Card.Body>
           </Card>

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
             {!selectedPermissionRole?<tr><td colSpan="7" className="text-center py-4 text-muted">Select a role to manage permissions.</td></tr>:null}
             {selectedPermissionRole&&!loadingRolePermissions&&selectedRolePermissions.length===0?<tr><td colSpan="7" className="text-center py-4 text-muted">No permissions found for this role.</td></tr>:null}
             {selectedRolePermissions.map(permission=><PermissionRow key={getId(permission)} permission={permission}/>)}
            </tbody>
           </Table>
          </Card.Body>
         </Card>
        </Col>
       </Row>
      </Tab>

      <Tab eventKey="userOverrides" title="User Overrides" disabled={!selectedBusiness}>
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={userOverrideFormRef}>
          <Card.Header>{editingUserOverrideId?"Edit User Override":"Add User Override"}</Card.Header>
          <Card.Body>
           <Form onSubmit={submitUserOverride}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>User</Form.Label>
               <Form.Select name="user" value={userOverrideForm.user} onChange={handleUserOverrideChange} required disabled={loadingUsers}>
                <option value="">Select user</option>
                {users.map(user=><option key={getId(user)} value={getId(user)}>{getUserLabel(user)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Department Scope</Form.Label>
               <Form.Select name="department" value={userOverrideForm.department} onChange={handleUserOverrideChange}>
                <option value="">Whole business</option>
                {departmentOptions.map(department=><option key={getId(department)} value={getId(department)}>{getDepartmentLabel(department)}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Module</Form.Label>
               <Form.Select name="module" value={userOverrideForm.module} onChange={handleUserOverrideChange} required>
                <option value="">Select module</option>
                {normalizedModuleOptions.map(module=><option key={module.value} value={module.value}>{module.label}</option>)}
               </Form.Select>
              </Form.Group>
             </Col>

             {["create","read","update","delete","admin"].map(field=>(
              <Col xs={12} key={field}>
               <Form.Group>
                <Form.Label>{field.charAt(0).toUpperCase()+field.slice(1)}</Form.Label>
                <OverrideSelect name={field} value={userOverrideForm[field]} onChange={handleUserOverrideChange}/>
               </Form.Group>
              </Col>
             ))}

             <Col xs={12}><Form.Check type="switch" id="overrideActive" name="isActive" label="Active" checked={userOverrideForm.isActive} onChange={handleUserOverrideChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingUserOverride||!userOverrideForm.user||!userOverrideForm.module}>
               {savingUserOverride?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingUserOverrideId?"Update Override":"Add Override"}</span>
              </Button>
              <Button type="button" variant="outline-secondary" onClick={resetUserOverrideForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>User Permission Overrides</span>
           {loadingUserOverrides?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>User</th>
              <th>Department</th>
              <th>Module</th>
              <th>C</th>
              <th>R</th>
              <th>U</th>
              <th>D</th>
              <th>A</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {!loadingUserOverrides&&userOverrides.length===0?<tr><td colSpan="10" className="text-center py-4 text-muted">No user overrides found.</td></tr>:null}

             {userOverrides.map(override=>(
              <tr key={getId(override)}>
               <td>{getUserLabel(override.user)}</td>
               <td>{override.department?.name||"Business"}</td>
               <td>{getModuleLabel(override.module)}</td>
               <td>{getOverrideValue(override.create)}</td>
               <td>{getOverrideValue(override.read)}</td>
               <td>{getOverrideValue(override.update)}</td>
               <td>{getOverrideValue(override.delete)}</td>
               <td>{getOverrideValue(override.admin)}</td>
               <td><Badge bg={override.isActive!==false?"success":"secondary"}>{override.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openUserOverrideForm(override)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/user-permission-overrides/${getId(override)}`,
                   messageText:"Delete this user override?",
                   afterDelete:()=>fetchUserOverrides(selectedBusiness)
                  })}
                 >
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

      <Tab eventKey="modules" title="Permission Modules">
       <Row className="g-4 mt-1">
        <Col xl={4}>
         <Card className="shadow-sm h-100" ref={moduleFormRef}>
          <Card.Header>{editingModuleId?"Edit Permission Module":"Add Permission Module"}</Card.Header>
          <Card.Body>
           <Form onSubmit={submitModule}>
            <Row className="g-3">
             <Col xs={12}>
              <Form.Group>
               <Form.Label>App Key</Form.Label>
               <Form.Control name="appKey" value={moduleForm.appKey} onChange={handleModuleChange} required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Module Key</Form.Label>
               <Form.Control name="key" value={moduleForm.key} onChange={handleModuleChange} required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Label</Form.Label>
               <Form.Control name="label" value={moduleForm.label} onChange={handleModuleChange} required/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Path</Form.Label>
               <Form.Control name="path" value={moduleForm.path} onChange={handleModuleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Group</Form.Label>
               <Form.Control name="group" value={moduleForm.group} onChange={handleModuleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Sort Order</Form.Label>
               <Form.Control type="number" name="sortOrder" value={moduleForm.sortOrder} onChange={handleModuleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={3} name="description" value={moduleForm.description} onChange={handleModuleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}><Form.Check type="switch" id="moduleSystem" name="isSystem" label="System module" checked={moduleForm.isSystem} onChange={handleModuleChange}/></Col>
             <Col xs={12}><Form.Check type="switch" id="moduleActive" name="isActive" label="Active" checked={moduleForm.isActive} onChange={handleModuleChange}/></Col>

             <Col xs={12} className="d-flex gap-2">
              <Button type="submit" disabled={savingModule||!moduleForm.appKey||!moduleForm.key||!moduleForm.label}>
               {savingModule?<Spinner size="sm" animation="border"/>:<Plus size={16}/>}
               <span className="ms-2">{editingModuleId?"Update Module":"Add Module"}</span>
              </Button>
              <Button type="button" variant="outline-secondary" onClick={resetModuleForm}>Clear</Button>
             </Col>
            </Row>
           </Form>
          </Card.Body>
         </Card>
        </Col>

        <Col xl={8}>
         <Card className="shadow-sm h-100">
          <Card.Header className="d-flex justify-content-between align-items-center">
           <span>Permission Modules</span>
           {loadingModules?<Spinner size="sm" animation="border"/>:null}
          </Card.Header>

          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Group</th>
              <th>Path</th>
              <th>Sort</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {!loadingModules&&moduleOptions.length===0?<tr><td colSpan="7" className="text-center py-4 text-muted">No permission modules found.</td></tr>:null}

             {moduleOptions.map(module=>(
              <tr key={getId(module)}>
               <td>{module.key}</td>
               <td>{module.label}</td>
               <td>{module.group||"-"}</td>
               <td>{module.path||"-"}</td>
               <td>{module.sortOrder??"-"}</td>
               <td><Badge bg={module.isActive!==false?"success":"secondary"}>{module.isActive!==false?"Active":"Inactive"}</Badge></td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button type="button" variant="outline-primary" onClick={()=>openModuleForm(module)}><Edit size={14}/></Button>
                 <Button
                  type="button"
                  variant="outline-danger"
                  onClick={()=>deleteRecord({
                   url:`/api/users/permission-modules/${getId(module)}`,
                   messageText:"Delete this permission module?",
                   afterDelete:()=>fetchModules()
                  })}
                 >
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
     </Tabs>
    </Col>
   </Row>
  </div>
 );
}