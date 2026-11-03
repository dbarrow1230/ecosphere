import {useEffect,useState} from "react";
import {Table,Spinner,Badge,Button,Modal} from "react-bootstrap";
import Alert from "../../../components/PopupAlert.jsx";
import UserForm from "../../forms/users/UserForm";

function Users()
{
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

 const adminRoleId="69d389f609a4ebea1c3f634e";
 const adminUserId="69af088d21b4580a8cb6614b";
 const ownerRoleNames=["owner","business owner","app owner","super admin"];
 const adminRoleNames=["admin","administrator"];

 const isValidObjectId=value=>{
  return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
 };

 const getObjectId=value=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object")
  {
   if(typeof value.$oid==="string")
   {
    return value.$oid;
   }

   if(typeof value._id==="string")
   {
    return value._id;
   }

   if(typeof value.id==="string")
   {
    return value.id;
   }

   if(typeof value._id?.$oid==="string")
   {
    return value._id.$oid;
   }

   if(typeof value.id?.$oid==="string")
   {
    return value.id.$oid;
   }
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
  if(!value||typeof value!=="object")
  {
   return null;
  }

  const userId=getObjectId(value);
  const roleId=getObjectId(value.role);

  if(!isValidObjectId(userId))
  {
   return null;
  }

  return{
   ...value,
   _id:userId,
   id:userId,
   role:value.role||null,
   roleId:roleId
  };
 };

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    const directUser=normalizeStoredUser(parsed);
    if(directUser)
    {
     return directUser;
    }

    const nestedUser=normalizeStoredUser(parsed?.user);
    if(nestedUser)
    {
     return nestedUser;
    }

    const dataUser=normalizeStoredUser(parsed?.data);
    if(dataUser)
    {
     return dataUser;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const getRoleId=role=>{
  const roleId=getObjectId(role);
  return isValidObjectId(roleId)?roleId:"";
 };

 const getRoleName=role=>{
  if(!role)
  {
   return "";
  }

  if(typeof role==="string")
  {
   const matchedRole=businessRoles.find(item=>getObjectId(item)===role);
   return matchedRole?String(matchedRole.name||matchedRole.roleName||matchedRole.title||"").toLowerCase():"";
  }

  if(typeof role==="object")
  {
   return String(role.name||role.roleName||role.title||"").toLowerCase();
  }

  return "";
 };

 const getAssignedRole=user=>{
  return user?.businessRoleAssignment?.role||
   user?.businessDepartmentAssignment?.role||
   user?.businessDepartmentAssignment?.department?.defaultRole||
   user?.role||
   null;
 };

 const getAssignedDepartment=user=>{
  return user?.businessDepartmentAssignment?.department||null;
 };

 const getAssignedRoleName=user=>{
  const role=getAssignedRole(user);
  const roleName=getRoleName(role);

  if(roleName)
  {
   return roleName;
  }

  const roleId=getObjectId(role);
  const matchedRole=businessRoles.find(item=>getObjectId(item)===roleId);
  return matchedRole?String(matchedRole.name||matchedRole.roleName||matchedRole.title||"").toLowerCase():"";
 };

 const formatRoleName=role=>{
  const roleName=getRoleName(role);
  return roleName||"-";
 };

 const getRoleSource=user=>{
  if(user?.businessRoleAssignment?.role)return "Direct role assignment";
  if(user?.businessDepartmentAssignment?.role)return "Department role override";
  if(user?.businessDepartmentAssignment?.department?.defaultRole)return "Department default role";
  if(user?.role)return "User profile role";
  return "No role assignment";
 };

 const formatDate=value=>{
  return value?new Date(value).toLocaleString():"-";
 };

 const isAdminUser=user=>{
  if(!user)
  {
   return false;
  }

  const userId=getObjectId(user);
  const roleId=getRoleId(user.role)||user.roleId||"";
  const roleName=getRoleName(user.role);

  const assignedRoleName=getAssignedRoleName(user);

  return userId===adminUserId||
   roleId===adminRoleId||
   adminRoleNames.includes(roleName)||
   ownerRoleNames.includes(roleName)||
   adminRoleNames.includes(assignedRoleName)||
   ownerRoleNames.includes(assignedRoleName);
 };

 const getRoleBadgeVariant=role=>{
  const roleName=getRoleName(role);

  if(roleName==="admin")
  {
   return "danger";
  }

  if(roleName==="manager")
  {
   return "warning";
  }

  if(roleName==="staff")
  {
   return "info";
  }

  if(roleName==="editor")
  {
   return "primary";
  }

  if(roleName==="viewer")
  {
   return "secondary";
  }

  if(roleName==="user")
  {
   return "success";
  }

  return "secondary";
 };

 const normalizeUsersResponse=data=>{
  if(Array.isArray(data))
  {
   return data;
  }

  if(Array.isArray(data?.users))
  {
   return data.users;
  }

  if(Array.isArray(data?.data))
  {
   return data.data;
  }

  return [];
 };

 const fetchUsers=async businessId=>{
  try
  {
   const loadUsers=async url=>{
    const res=await fetch(url);
    const data=await res.json();

    if(!res.ok)
    {
     throw new Error(data?.message||"Failed to load users");
    }

    return normalizeUsersResponse(data);
   };

   const scopedUsers=businessId?await loadUsers(`/api/users?business=${encodeURIComponent(String(businessId))}`):[];
   const nextUsers=scopedUsers.length?scopedUsers:await loadUsers("/api/users");

   setUsers(nextUsers);
  }
  catch(err)
  {
   setError(err.message||"Failed to load users");
   setUsers([]);
  }
  finally
  {
   setLoading(false);
  }
 };

 const fetchBusinessRoles=async businessId=>{
  if(!businessId)
  {
   setBusinessRoles([]);
   return;
  }

  try
  {
   const res=await fetch(`/api/users/roles?business=${encodeURIComponent(String(businessId))}`);
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load roles");
   }

   if(Array.isArray(data.data))
   {
    setBusinessRoles(data.data);
   }
   else if(Array.isArray(data.roles))
   {
    setBusinessRoles(data.roles);
   }
   else if(Array.isArray(data))
   {
    setBusinessRoles(data);
   }
   else
   {
    setBusinessRoles([]);
   }
  }
  catch(err)
  {
   console.error("Role load error",err);
   setBusinessRoles([]);
  }
 };

 useEffect(()=>{
  const initializePage=async()=>{
   const parsedUser=getStoredUser();

   if(!parsedUser)
   {
    setError("You must be logged in to view this page.");
    setLoading(false);
    return;
   }

   if(!isAdminUser(parsedUser))
   {
    setError("You do not have permission to view this page.");
    setLoading(false);
    return;
   }

   const businessId=await loadCurrentAppBusinessId();
   setCurrentBusinessId(businessId);
   await fetchBusinessRoles(businessId);
   await fetchUsers(businessId);
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
  if(!user?._id||!currentBusinessId)
  {
   setDetailPermissions([]);
   return;
  }

  const res=await fetch(`/api/users/effective-permissions?user=${encodeURIComponent(String(user._id))}&business=${encodeURIComponent(String(currentBusinessId))}`);
  const data=await res.json().catch(()=>null);

  if(!res.ok)
  {
   throw new Error(data?.message||"Failed to load effective permissions");
  }

  setDetailPermissions(Array.isArray(data?.data)?data.data:[]);
 };

 const handleShowDetails=async user=>{
  setDetailUser(user);
  setDetailPermissions([]);
  setShowDetails(true);

  try
  {
   setLoadingDetails(true);
   await fetchEffectivePermissions(user);
  }
  catch(err)
  {
   showTimedAlert("danger",err.message||"Failed to load user permissions");
  }
  finally
  {
   setLoadingDetails(false);
  }
 };

 const closeDetails=()=>{
  setShowDetails(false);
  setDetailUser(null);
  setDetailPermissions([]);
 };

 const handleDelete=async()=>{
  if(!userToDelete)
  {
   return;
  }

  try
  {
   const res=await fetch(`/api/users/${userToDelete._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Delete failed");
   }

   setUsers(prev=>prev.filter(user=>user._id!==userToDelete._id));
   showTimedAlert("success","User deleted");
  }
  catch(err)
  {
   showTimedAlert("danger",err.message||"Delete failed");
  }
  finally
  {
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

 if(loading)
 {
  return(
   <main className="admin-users-page text-center"><Spinner animation="border"/></main>
  );
 }

 return(
  <main className="admin-users-page">

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

      {users.length===0?
       <tr><td colSpan="6" className="text-center">No users found.</td></tr>
      :
       users.map(user=>(
        <tr key={user._id} className="admin-users-table-row" onClick={()=>handleShowDetails(user)} tabIndex={0} onKeyDown={event=>{
         if(event.key==="Enter"||event.key===" ")
         {
          event.preventDefault();
          handleShowDetails(user);
         }
        }}>
         <td>{user.username||"-"}</td>
         <td>{user.email||"-"}</td>
         <td>
         <Badge bg={getRoleBadgeVariant(getAssignedRole(user))}>
          {getAssignedRoleName(user)||"-"}
         </Badge>
        </td>
        <td><Badge bg={user.isActive?"success":"secondary"}>{user.isActive?"Active":"Inactive"}</Badge></td>
         <td>{user.lastLogin?new Date(user.lastLogin).toLocaleString():"-"}</td>
         <td>
          <div className="d-flex gap-2" onClick={event=>event.stopPropagation()}>
           <Button size="sm" variant="outline-primary" onClick={()=>handleShowDetails(user)}>Details</Button>
           <Button size="sm" variant="outline-warning" onClick={()=>handleEdit(user)}>Edit</Button>
           <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteConfirm(user)}>Delete</Button>
          </div>
         </td>
        </tr>
       ))
      }

     </tbody>
    </Table>
   }

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered scrollable backdrop="static">
    <Modal.Header closeButton><Modal.Title>{currentUser?"Edit User":"Add User"}</Modal.Title></Modal.Header>
    <Modal.Body className="px-4 py-4"><UserForm user={currentUser} businessId={currentBusinessId} onSuccess={handleFormSuccess}/></Modal.Body>
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
             {getAssignedRoleName(detailUser)||"-"}
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
           <td>{formatRoleName(getAssignedDepartment(detailUser)?.defaultRole)}</td>
           <th>Role Override</th>
           <td>{formatRoleName(detailUser?.businessDepartmentAssignment?.role)}</td>
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
            <td>{permission.create?"Yes":"-"}</td>
            <td>{permission.read?"Yes":"-"}</td>
            <td>{permission.update?"Yes":"-"}</td>
            <td>{permission.delete?"Yes":"-"}</td>
            <td>{permission.admin?"Yes":"-"}</td>
           </tr>
          ))}
         </tbody>
        </Table>
       </section>
      </div>
     ):null}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="outline-warning" onClick={()=>{
      const user=detailUser;
      closeDetails();
      handleEdit(user);
     }} disabled={!detailUser}>Edit User</Button>
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

  </main>
 );
}

export default Users;
