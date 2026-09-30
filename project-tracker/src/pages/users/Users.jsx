import {useEffect,useState} from "react";
import {Container,Table,Spinner,Alert,Badge,Button,Modal} from "react-bootstrap";
import UserForm from "../forms/users/UserForm";

function Users()
{
 const [users,setUsers]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [accessDenied,setAccessDenied]=useState(false);
 const [showForm,setShowForm]=useState(false);
 const [currentUser,setCurrentUser]=useState(null);
 const [showDelete,setShowDelete]=useState(false);
 const [userToDelete,setUserToDelete]=useState(null);
 const [alert,setAlert]=useState(null);

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    if(parsed?._id)
    {
     return parsed;
    }

    if(parsed?.user?._id)
    {
     return parsed.user;
    }

    if(parsed?.data?._id)
    {
     return parsed.data;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 useEffect(()=>{
  const parsedUser=getStoredUser();

  if(!parsedUser)
  {
   setAccessDenied(true);
   setLoading(false);
   return;
  }

  const role=parsedUser?.role||"";
  const permissions=Array.isArray(parsedUser?.permissions)?parsedUser.permissions:[];
  const canViewUsers=
   role==="admin"||
   permissions.includes("view_users")||
   permissions.includes("users.view")||
   permissions.includes("manage_users");

  if(!canViewUsers)
  {
   setAccessDenied(true);
   setLoading(false);
   return;
  }

  fetchUsers();
 },[]);

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

 const showTimedAlert=(variant,message)=>{
  setAlert({variant,message});
  setTimeout(()=>{setAlert(null);},5000);
 };

 const handleAdd=()=>{
  setCurrentUser(null);
  setShowForm(true);
 };

 const handleEdit=(user)=>{
  setCurrentUser(user);
  setShowForm(true);
 };

 const handleDeleteConfirm=(user)=>{
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

 const handleFormSuccess=(savedUser)=>{
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

 if(accessDenied)
 {
  return(
   <Container className="py-5"><Alert variant="danger">You do not have permission to view this page.</Alert></Container>
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

   <Table striped hover responsive>
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
       <tr key={user._id}>
        <td>{user.username||"-"}</td>
        <td>{user.email||"-"}</td>
        <td><Badge bg={user.role==="admin"?"danger":user.role==="staff"?"warning":"secondary"}>{user.role||"user"}</Badge></td>
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