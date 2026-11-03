import {useEffect,useState} from "react";
import {Container,Table,Spinner,Alert,Badge,Button,Modal} from "react-bootstrap";
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
 const [alert,setAlert]=useState(null);

 const adminRoleId="69d389f609a4ebea1c3f634e";
 const adminUserId="69af088d21b4580a8cb6614b";

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
   return "";
  }

  if(typeof role==="object")
  {
   return String(role.name||role.roleName||role.title||"").toLowerCase();
  }

  return "";
 };

 const isAdminUser=user=>{
  if(!user)
  {
   return false;
  }

  const userId=getObjectId(user);
  const roleId=getRoleId(user.role)||user.roleId||"";
  const roleName=getRoleName(user.role);

  return userId===adminUserId||roleId===adminRoleId||roleName==="admin";
 };

 const getHardinessZoneLabel=hardinessZone=>{
  if(!hardinessZone)
  {
   return "—";
  }

  if(typeof hardinessZone==="string")
  {
   return isValidObjectId(hardinessZone)?"—":hardinessZone;
  }

  if(typeof hardinessZone==="object")
  {
   return hardinessZone.zone||hardinessZone.name||hardinessZone.label||"—";
  }

  return "—";
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

 const fetchUsers=async()=>{
  try
  {
   const res=await fetch("/api/users");
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load users");
   }

   if(Array.isArray(data))
   {
    setUsers(data);
   }
   else if(Array.isArray(data.users))
   {
    setUsers(data.users);
   }
   else if(Array.isArray(data.data))
   {
    setUsers(data.data);
   }
   else
   {
    setUsers([]);
   }
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

   await fetchUsers();
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

 const handleFormSuccess=savedUser=>{
  setShowForm(false);

  setUsers(prev=>{
   const exists=prev.find(user=>user._id===savedUser._id);

   if(exists)
   {
    return prev.map(user=>user._id===savedUser._id?savedUser:user);
   }

   return [...prev,savedUser];
  });

  showTimedAlert("success","User saved");
 };

 if(loading)
 {
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
    <Table striped hover responsive>
     <thead>
      <tr>
       <th>Username</th>
       <th>Email</th>
       <th>Role</th>
       <th>Hardiness Zone</th>
       <th>Status</th>
       <th>Last Login</th>
       <th></th>
      </tr>
     </thead>
     <tbody>

      {users.length===0?
       <tr><td colSpan="7" className="text-center">No users found.</td></tr>
      :
       users.map(user=>(
        <tr key={user._id}>
         <td>{user.username||"-"}</td>
         <td>{user.email||"-"}</td>
         <td>
          <Badge bg={getRoleBadgeVariant(user.role)}>
           {getRoleName(user.role)||"—"}
          </Badge>
         </td>
         <td>{getHardinessZoneLabel(user.hardinessZone)}</td>
         <td><Badge bg={user.isActive?"success":"secondary"}>{user.isActive?"Active":"Inactive"}</Badge></td>
         <td>{user.lastLogin?new Date(user.lastLogin).toLocaleString():"-"}</td>
         <td>
          <div className="d-flex gap-2">
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
    <Modal.Body className="px-4 py-4"><UserForm user={currentUser} onSuccess={handleFormSuccess}/></Modal.Body>
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