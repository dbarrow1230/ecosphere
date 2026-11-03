// src/pages/users/Users.jsx
import {useEffect,useState} from "react";
import {Container,Table,Spinner,Alert,Badge,Button,Modal} from "react-bootstrap";
import UserForm from "../../forms/users/UserForm";

function Users(){
 const [users,setUsers]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [currentUser,setCurrentUser]=useState(null);
 const [showDelete,setShowDelete]=useState(false);
 const [userToDelete,setUserToDelete]=useState(null);
 const [showDetails,setShowDetails]=useState(false);
 const [detailUser,setDetailUser]=useState(null);
 const [detailPermissions,setDetailPermissions]=useState([]);
 const [loadingDetails,setLoadingDetails]=useState(false);
 const [alert,setAlert]=useState(null);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [businessRoles,setBusinessRoles]=useState([]);

 const ownerRoleNames=["owner","business owner","app owner","super admin"];
 const adminRoleNames=["admin","administrator"];

 const isValidObjectId=value=>{
  return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
 };

 const getObjectId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;

  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
   if(typeof value.id==="string")return value.id;
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

 const loadCurrentAppBusinessId=async()=>{
  const appKey=getRuntimeAppKey();
  if(!appKey)return "";

  const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
   cache:"no-store",
   headers:{
    "Cache-Control":"no-cache",
    "Pragma":"no-cache"
   }
  });

  if(!res.ok)return "";

  const data=await res.json().catch(()=>null);
  return getObjectId(unwrapBusiness(data));
 };

 const normalizeStoredUser=value=>{
  if(!value||typeof value!=="object")return null;

  const userId=getObjectId(value);

  if(!isValidObjectId(userId))return null;

  return{
   ...value,
   _id:userId,
   id:userId
  };
 };

 const getStoredUser=()=>{
  const keys=["user","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

    if(!raw)continue;

    const parsed=JSON.parse(raw);

    const directUser=normalizeStoredUser(parsed);
    if(directUser)return directUser;

    const nestedUser=normalizeStoredUser(parsed?.user);
    if(nestedUser)return nestedUser;

    const dataUser=normalizeStoredUser(parsed?.data);
    if(dataUser)return dataUser;
   }catch(err){
    console.error(`Failed to parse storage key: ${key}`,err);
   }
  }

  return null;
 };

 const getRoleName=role=>{
  if(!role)return "";

  if(typeof role==="string"){
   if(isValidObjectId(role)){
    const matchedRole=businessRoles.find(item=>getObjectId(item)===role);
    return matchedRole?String(matchedRole.name||matchedRole.label||"").toLowerCase():"";
   }

   return role.toLowerCase();
  }

  if(typeof role==="object")
   return String(role.name||role.label||role.roleName||role.title||"").toLowerCase();

  return "";
 };

 const getRoleLabel=role=>{
  if(!role)return "-";

  if(typeof role==="string"){
   if(isValidObjectId(role)){
    const matchedRole=businessRoles.find(item=>getObjectId(item)===role);
    return matchedRole?String(matchedRole.label||matchedRole.name||"-"):"-";
   }

   return role;
  }

  if(typeof role==="object")
   return String(role.label||role.name||role.roleName||role.title||"-");

  return "-";
 };

 const getDepartmentAssignments=user=>{
  return Array.isArray(user?.businessDepartmentAssignments)?user.businessDepartmentAssignments:[];
 };

 const getPrimaryDepartmentAssignment=user=>{
  const assignments=getDepartmentAssignments(user);

  if(!assignments.length)return null;

  return assignments.find(item=>item?.isPrimary)||assignments[0];
 };

 const getAssignedRole=user=>{
  const businessRole=user?.businessRoleAssignment?.role;

  if(businessRole)return businessRole;

  const departmentAssignment=getPrimaryDepartmentAssignment(user);

  return departmentAssignment?.roleOverride||
   departmentAssignment?.department?.defaultRole||
   null;
 };

 const getAssignedDepartment=user=>{
  return getPrimaryDepartmentAssignment(user)?.department||null;
 };

 const getAssignedRoleName=user=>{
  return getRoleName(getAssignedRole(user));
 };

 const getRoleSource=user=>{
  const departmentAssignment=getPrimaryDepartmentAssignment(user);

  if(user?.businessRoleAssignment?.role)return "Business role assignment";
  if(departmentAssignment?.roleOverride)return "Department role override";
  if(departmentAssignment?.department?.defaultRole)return "Department default role";

  return "No role assignment";
 };

 const isAdminUser=user=>{
  const businessRoleName=getRoleName(user?.businessRoleAssignment?.role);

  return adminRoleNames.includes(businessRoleName)||ownerRoleNames.includes(businessRoleName);
 };

 const getRoleBadgeVariant=role=>{
  const roleName=getRoleName(role);

  if(roleName==="owner")return "dark";
  if(roleName==="admin"||roleName==="administrator")return "danger";
  if(roleName==="manager")return "warning";
  if(roleName==="staff")return "info";
  if(roleName==="editor")return "primary";
  if(roleName==="viewer")return "secondary";
  if(roleName==="user")return "success";

  return "secondary";
 };

 const formatDate=value=>{
  if(!value)return "-";

  const date=new Date(value);

  if(Number.isNaN(date.getTime()))return "-";

  return date.toLocaleString();
 };

 const getPermissionFlag=(permission,field)=>{
  if(permission?.permissions&&permission.permissions[field]!==undefined)
   return !!permission.permissions[field];

  return !!permission?.[field];
 };

 const fetchUsers=async businessId=>{
  try{
   if(!businessId){
    setUsers([]);
    setError("No current business is configured for this app.");
    return;
   }

   const res=await fetch(`/api/users?business=${encodeURIComponent(String(businessId))}`);
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to load users");

   if(Array.isArray(data))setUsers(data);
   else if(Array.isArray(data.users))setUsers(data.users);
   else if(Array.isArray(data.data))setUsers(data.data);
   else setUsers([]);
  }catch(err){
   setError(err.message||"Failed to load users");
   setUsers([]);
  }finally{
   setLoading(false);
  }
 };

 const fetchBusinessRoles=async businessId=>{
  if(!businessId){
   setBusinessRoles([]);
   return [];
  }

  try{
   const res=await fetch(`/api/users/roles?business=${encodeURIComponent(String(businessId))}`);
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to load roles");

   const roles=Array.isArray(data.data)?data.data:Array.isArray(data.roles)?data.roles:Array.isArray(data)?data:[];

   setBusinessRoles(roles);

   return roles;
  }catch(err){
   console.error("Role load error",err);
   setBusinessRoles([]);
   return [];
  }
 };

 const fetchScopedCurrentUser=async({userId,businessId})=>{
  const res=await fetch(`/api/users/${encodeURIComponent(userId)}?business=${encodeURIComponent(String(businessId))}`,{
   cache:"no-store",
   headers:{
    "Cache-Control":"no-cache",
    "Pragma":"no-cache"
   }
  });

  const data=await res.json().catch(()=>null);

  if(!res.ok)throw new Error(data?.message||"Failed to load current user access");

  return data?.data||data?.user||data;
 };

 const fetchPermissionModules=async()=>{
  const appKey=getRuntimeAppKey();

  if(!appKey)return [];

  const res=await fetch(`/api/users/permission-modules?appKey=${encodeURIComponent(appKey)}&isActive=true`,{
   cache:"no-store",
   headers:{
    "Cache-Control":"no-cache",
    "Pragma":"no-cache"
   }
  });

  const data=await res.json().catch(()=>null);

  if(!res.ok)throw new Error(data?.message||"Failed to load permission modules");

  return Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
 };

 useEffect(()=>{
  const initializePage=async()=>{
   try{
    const parsedUser=getStoredUser();

    if(!parsedUser){
     setError("You must be logged in to view this page.");
     setLoading(false);
     return;
    }

    const businessId=await loadCurrentAppBusinessId();

    if(!businessId){
     setError("No current business is configured for this app.");
     setLoading(false);
     return;
    }

    setCurrentBusinessId(businessId);

    await fetchBusinessRoles(businessId);

    const scopedCurrentUser=await fetchScopedCurrentUser({
     userId:parsedUser._id,
     businessId
    });

    if(!isAdminUser(scopedCurrentUser)){
     setError("You do not have permission to view this page.");
     setLoading(false);
     return;
    }

    await fetchUsers(businessId);
   }catch(err){
    console.error("Users page init error",err);
    setError(err.message||"Failed to initialize users page");
    setLoading(false);
   }
  };

  initializePage();
 },[]);

 const showTimedAlert=(variant,message)=>{
  setAlert({variant,message});
  setTimeout(()=>{setAlert(null);},5000);
 };

 const handleAdd=()=>{
  setCurrentUser(null);
  setShowForm(true);
 };

 const handleEdit=user=>{
  setCurrentUser(user);
  setShowForm(true);
 };

 const handleDeleteConfirm=user=>{
  setUserToDelete(user);
  setShowDelete(true);
 };

 const fetchEffectivePermissions=async user=>{
  if(!user?._id||!currentBusinessId){
   setDetailPermissions([]);
   return;
  }

  const modules=await fetchPermissionModules();
  const moduleKeys=modules.map(item=>String(item.key||"").trim().toLowerCase()).filter(Boolean);

  if(!moduleKeys.length){
   setDetailPermissions([]);
   return;
  }

  const params=new URLSearchParams({
   user:String(user._id),
   business:String(currentBusinessId),
   modules:moduleKeys.join(",")
  });

  const departmentId=getObjectId(getAssignedDepartment(user));

  if(departmentId)params.set("department",departmentId);

  const res=await fetch(`/api/users/effective-permissions?${params.toString()}`);
  const data=await res.json().catch(()=>null);

  if(!res.ok)throw new Error(data?.message||"Failed to load effective permissions");

  setDetailPermissions(Array.isArray(data?.data)?data.data:[]);
 };

 const handleShowDetails=async user=>{
  setDetailUser(user);
  setDetailPermissions([]);
  setShowDetails(true);

  try{
   setLoadingDetails(true);
   await fetchEffectivePermissions(user);
  }catch(err){
   showTimedAlert("danger",err.message||"Failed to load user permissions");
  }finally{
   setLoadingDetails(false);
  }
 };

 const closeDetails=()=>{
  setShowDetails(false);
  setDetailUser(null);
  setDetailPermissions([]);
 };

 const handleDelete=async()=>{
  if(!userToDelete)return;

  try{
   const res=await fetch(`/api/users/${userToDelete._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Delete failed");

   setUsers(prev=>prev.filter(user=>user._id!==userToDelete._id));
   showTimedAlert("success","User deleted");
  }catch(err){
   showTimedAlert("danger",err.message||"Delete failed");
  }finally{
   setShowDelete(false);
   setUserToDelete(null);
  }
 };

 const handleFormSuccess=async()=>{
  setShowForm(false);
  await fetchBusinessRoles(currentBusinessId);
  await fetchUsers(currentBusinessId);
  showTimedAlert("success","User saved");
 };

 if(loading){
  return(
   <Container className="py-5 text-center"><Spinner animation="border"/></Container>
  );
 }

 return(
  <Container className="py-5">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <h1 className="mb-0">Users</h1>
    <Button onClick={handleAdd}>Add User</Button>
   </div>

   {alert&&<Alert variant={alert.variant}>{alert.message}</Alert>}
   {error&&<Alert variant="danger">{error}</Alert>}

   {!error&&
    <Table hover responsive className="admin-users-table">
     <thead>
      <tr>
       <th>Username</th>
       <th>Email</th>
       <th>Role</th>
       <th>Status</th>
       <th>Last Login</th>
       <th></th>
      </tr>
     </thead>
     <tbody>
      {users.length===0?(
       <tr><td colSpan="6" className="text-center">No users found.</td></tr>
      ):(
       users.map(user=>(
        <tr
         key={user._id}
         className="admin-users-table-row"
         onClick={()=>handleShowDetails(user)}
         tabIndex={0}
         onKeyDown={event=>{
          if(event.key==="Enter"||event.key===" "){
           event.preventDefault();
           handleShowDetails(user);
          }
         }}
        >
         <td>{user.username||"-"}</td>
         <td>{user.email||"-"}</td>
         <td>
          <Badge bg={getRoleBadgeVariant(getAssignedRole(user))}>
           {getRoleLabel(getAssignedRole(user))}
          </Badge>
         </td>
         <td><Badge bg={user.isActive?"success":"secondary"}>{user.isActive?"Active":"Inactive"}</Badge></td>
         <td>{formatDate(user.lastLogin)}</td>
         <td>
          <div className="d-flex gap-2" onClick={event=>event.stopPropagation()}>
           <Button size="sm" variant="outline-primary" onClick={()=>handleShowDetails(user)}>Details</Button>
           <Button size="sm" variant="outline-warning" onClick={()=>handleEdit(user)}>Edit</Button>
           <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteConfirm(user)}>Delete</Button>
          </div>
         </td>
        </tr>
       ))
      )}
     </tbody>
    </Table>
   }

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered scrollable backdrop="static">
    <Modal.Header closeButton><Modal.Title>{currentUser?"Edit User":"Add User"}</Modal.Title></Modal.Header>
    <Modal.Body className="px-4 py-4">
     <UserForm user={currentUser} businessId={currentBusinessId} onSuccess={handleFormSuccess}/>
    </Modal.Body>
   </Modal>

   <Modal show={showDetails} onHide={closeDetails} size="xl" centered scrollable>
    <Modal.Header closeButton>
     <Modal.Title>User Details</Modal.Title>
    </Modal.Header>

    <Modal.Body className="px-4 py-4">
     {detailUser?(
      <div className="admin-user-detail">
       <section className="admin-user-detail-section">
        <h4>{detailUser.username||"User"}</h4>

        <Table responsive bordered className="mb-0">
         <tbody>
          <tr>
           <th>Username</th>
           <td>{detailUser.username||"-"}</td>
           <th>Email</th>
           <td>{detailUser.email||"-"}</td>
          </tr>

          <tr>
           <th>Status</th>
           <td><Badge bg={detailUser.isActive?"success":"secondary"}>{detailUser.isActive?"Active":"Inactive"}</Badge></td>
           <th>Last Login</th>
           <td>{formatDate(detailUser.lastLogin)}</td>
          </tr>

          <tr>
           <th>Role Source</th>
           <td>{getRoleSource(detailUser)}</td>
           <th>Effective Role</th>
           <td>
            <Badge bg={getRoleBadgeVariant(getAssignedRole(detailUser))}>
             {getRoleLabel(getAssignedRole(detailUser))}
            </Badge>
           </td>
          </tr>

          <tr>
           <th>Department</th>
           <td>{getAssignedDepartment(detailUser)?.name||"-"}</td>
           <th>Department Code</th>
           <td>{getAssignedDepartment(detailUser)?.code||"-"}</td>
          </tr>

          <tr>
           <th>Department Default Role</th>
           <td>{getRoleLabel(getAssignedDepartment(detailUser)?.defaultRole)}</td>
           <th>Role Override</th>
           <td>{getRoleLabel(getPrimaryDepartmentAssignment(detailUser)?.roleOverride)}</td>
          </tr>
         </tbody>
        </Table>
       </section>

       <section className="admin-user-detail-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
         <h4 className="mb-0">Effective Permissions</h4>
         {loadingDetails?<Spinner size="sm" animation="border"/>:null}
        </div>

        <Table responsive bordered hover className="mb-0 align-middle">
         <thead>
          <tr>
           <th>Module</th>
           <th>Create</th>
           <th>Read</th>
           <th>Update</th>
           <th>Delete</th>
           <th>Admin</th>
          </tr>
         </thead>

         <tbody>
          {!loadingDetails&&detailPermissions.length===0?(
           <tr>
            <td colSpan="6" className="text-center text-muted">No effective permissions found.</td>
           </tr>
          ):null}

          {detailPermissions.map(permission=>(
           <tr key={permission.module}>
            <td>{permission.module}</td>
            <td>{getPermissionFlag(permission,"create")?"Yes":"-"}</td>
            <td>{getPermissionFlag(permission,"read")?"Yes":"-"}</td>
            <td>{getPermissionFlag(permission,"update")?"Yes":"-"}</td>
            <td>{getPermissionFlag(permission,"delete")?"Yes":"-"}</td>
            <td>{getPermissionFlag(permission,"admin")?"Yes":"-"}</td>
           </tr>
          ))}
         </tbody>
        </Table>
       </section>
      </div>
     ):null}
    </Modal.Body>

    <Modal.Footer>
     <Button
      variant="outline-warning"
      onClick={()=>{
       const user=detailUser;
       closeDetails();
       handleEdit(user);
      }}
      disabled={!detailUser}
     >
      Edit User
     </Button>
     <Button variant="secondary" onClick={closeDetails}>Close</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showDelete} onHide={()=>setShowDelete(false)} centered>
    <Modal.Header closeButton><Modal.Title>Delete User</Modal.Title></Modal.Header>
    <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default Users;