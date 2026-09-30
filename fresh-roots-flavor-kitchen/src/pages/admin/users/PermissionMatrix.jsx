import {useEffect,useState} from "react";
import {Container,Row,Col,Card,Form,Table,Button,Spinner,Alert,Badge} from "react-bootstrap";

function PermissionMatrix()
{
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [alert,setAlert]=useState(null);
 const [users,setUsers]=useState([]);
 const [roles,setRoles]=useState([]);
 const [permissions,setPermissions]=useState([]);
 const [scope,setScope]=useState("role");
 const [selectedRole,setSelectedRole]=useState("");
 const [selectedUser,setSelectedUser]=useState("");
 const [modules]=useState([
  "dashboard",
  "events",
  "clients",
  "menus",
  "orders",
  "inventory",
  "reports",
  "users",
  "permissions",
  "settings"
 ]);
 const [matrix,setMatrix]=useState({});

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

 const showTimedAlert=(variant,message)=>{
  setAlert({variant,message});
  setTimeout(()=>{setAlert(null);},5000);
 };

 const buildEmptyMatrix=()=>{
  const nextMatrix={};

  modules.forEach(module=>{
   nextMatrix[module]={
    create:false,
    read:false,
    update:false,
    delete:false,
    admin:false,
    _id:null
   };
  });

  setPermissions([]);
  setMatrix(nextMatrix);
 };

 const normalizePermissionsToMatrix=(rows)=>{
  const nextMatrix={};

  modules.forEach(module=>{
   const found=rows.find(row=>row.module===module);

   nextMatrix[module]={
    create:!!found?.create,
    read:!!found?.read,
    update:!!found?.update,
    delete:!!found?.delete,
    admin:!!found?.admin,
    _id:found?._id||null
   };
  });

  setPermissions(rows);
  setMatrix(nextMatrix);
 };

 const fetchRoles=async()=>{
  try
  {
   const res=await fetch("/api/users/roles");
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load roles");
   }

   const nextRoles=Array.isArray(data.data)?data.data:Array.isArray(data.roles)?data.roles:[];
   setRoles(nextRoles);

   return nextRoles;
  }
  catch(err)
  {
   throw new Error(err.message||"Failed to load roles");
  }
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

   const nextUsers=Array.isArray(data.data)?data.data:Array.isArray(data.users)?data.users:[];
   setUsers(nextUsers);
  }
  catch(err)
  {
   throw new Error(err.message||"Failed to load users");
  }
 };

 const loadPermissionsByRole=async(roleId)=>{
  if(!roleId)
  {
   buildEmptyMatrix();
   setLoading(false);
   return;
  }

  setLoading(true);
  setError("");

  try
  {
   const res=await fetch(`/api/users/permissions?role=${encodeURIComponent(String(roleId))}`);
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load permissions");
   }

   const rows=Array.isArray(data.data)?data.data:Array.isArray(data.permissions)?data.permissions:[];
   normalizePermissionsToMatrix(rows);
  }
  catch(err)
  {
   setError(err.message||"Failed to load permissions");
   buildEmptyMatrix();
  }
  finally
  {
   setLoading(false);
  }
 };

 const loadPermissionsByUser=async(userId)=>{
  if(!userId)
  {
   buildEmptyMatrix();
   setLoading(false);
   return;
  }

  setLoading(true);
  setError("");

  try
  {
   const res=await fetch(`/api/users/permissions?user=${encodeURIComponent(String(userId))}`);
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to load permissions");
   }

   const rows=Array.isArray(data.data)?data.data:Array.isArray(data.permissions)?data.permissions:[];
   normalizePermissionsToMatrix(rows);
  }
  catch(err)
  {
   setError(err.message||"Failed to load permissions");
   buildEmptyMatrix();
  }
  finally
  {
   setLoading(false);
  }
 };

 useEffect(()=>{
  const initializePage=async()=>{
   const currentUser=getStoredUser();
   const permissionsList=Array.isArray(currentUser?.permissions)?currentUser.permissions:[];
   const allowed=permissionsList.includes("manage_users")||permissionsList.includes("permissions.admin")||permissionsList.includes("permissions.update")||!!currentUser?._id;

   if(!allowed)
   {
    setError("You do not have permission to view this page.");
    setLoading(false);
    return;
   }

   try
   {
    const nextRoles=await fetchRoles();
    await fetchUsers();

    if(nextRoles.length>0)
    {
     const firstRoleId=String(nextRoles[0]._id||"");
     setSelectedRole(firstRoleId);
     await loadPermissionsByRole(firstRoleId);
    }
    else
    {
     buildEmptyMatrix();
     setLoading(false);
    }
   }
   catch(err)
   {
    setError(err.message||"Failed to initialize permission matrix");
    setLoading(false);
   }
  };

  initializePage();
 },[]);

 useEffect(()=>{
  if(error&&Object.keys(matrix).length===0)
  {
   return;
  }

  if(scope==="role")
  {
   if(selectedRole)
   {
    loadPermissionsByRole(String(selectedRole));
   }
   else
   {
    buildEmptyMatrix();
    setLoading(false);
   }
  }

  if(scope==="user"&&selectedUser)
  {
   loadPermissionsByUser(String(selectedUser));
  }

  if(scope==="user"&&!selectedUser)
  {
   buildEmptyMatrix();
   setLoading(false);
  }
 },[scope,selectedRole,selectedUser]);

 const handleScopeChange=(e)=>{
  const value=e.target.value;
  setScope(value);
  setPermissions([]);
  setError("");

  if(value==="role")
  {
   setSelectedUser("");
  }
 };

 const handleRoleChange=(e)=>{
  setSelectedRole(String(e.target.value||""));
 };

 const handleUserChange=(e)=>{
  setSelectedUser(String(e.target.value||""));
 };

 const handlePermissionToggle=(module,field)=>{
  setMatrix(prev=>{
   const currentRow=prev[module]||{
    _id:null,
    create:false,
    read:false,
    update:false,
    delete:false,
    admin:false
   };

   const nextValue=!currentRow[field];
   const nextRow={
    ...currentRow,
    [field]:nextValue
   };

   if(field==="admin")
   {
    nextRow.create=nextValue;
    nextRow.read=nextValue;
    nextRow.update=nextValue;
    nextRow.delete=nextValue;
    nextRow.admin=nextValue;
   }
   else
   {
    nextRow.admin=!!(nextRow.create&&nextRow.read&&nextRow.update&&nextRow.delete);
   }

   return{
    ...prev,
    [module]:nextRow
   };
  });
 };

 const handleSaveAll=async()=>{
  if(scope==="role"&&!selectedRole)
  {
   setError("Select a role first");
   return;
  }

  if(scope==="user"&&!selectedUser)
  {
   setError("Select a user first");
   return;
  }

  setSaving(true);
  setError("");

  try
  {
   for(const module of modules)
   {
    const row=matrix[module]||{
     create:false,
     read:false,
     update:false,
     delete:false,
     admin:false,
     _id:null
    };

    const payload={
     user:scope==="user"&&selectedUser?String(selectedUser):null,
     role:scope==="role"&&selectedRole?String(selectedRole):null,
     module,
     create:!!row.create,
     read:!!row.read,
     update:!!row.update,
     delete:!!row.delete,
     admin:!!row.admin
    };

    let res;
    let data;

    if(row._id)
    {
     res=await fetch(`/api/users/permissions/${row._id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
     });
    }
    else
    {
     res=await fetch("/api/users/permissions",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
     });
    }

    data=await res.json();

    if(!res.ok)
    {
     throw new Error(data?.message||`Failed to save permission for ${module}`);
    }
   }

   if(scope==="role")
   {
    await loadPermissionsByRole(String(selectedRole));
   }
   else if(selectedUser)
   {
    await loadPermissionsByUser(String(selectedUser));
   }

   showTimedAlert("success","Permission matrix saved");
  }
  catch(err)
  {
   setError(err.message||"Failed to save permissions");
  }
  finally
  {
   setSaving(false);
  }
 };

 const handleDeleteRow=async(module)=>{
  const row=matrix[module];

  if(!row?._id)
  {
   setMatrix(prev=>({
    ...prev,
    [module]:{
     create:false,
     read:false,
     update:false,
     delete:false,
     admin:false,
     _id:null
    }
   }));
   return;
  }

  try
  {
   const res=await fetch(`/api/users/permissions/${row._id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to delete permission");
   }

   setMatrix(prev=>({
    ...prev,
    [module]:{
     create:false,
     read:false,
     update:false,
     delete:false,
     admin:false,
     _id:null
    }
   }));

   setPermissions(prev=>prev.filter(permission=>permission._id!==row._id));
   showTimedAlert("success",`Permission removed for ${module}`);
  }
  catch(err)
  {
   setError(err.message||"Failed to delete permission");
  }
 };

 if(loading&&Object.keys(matrix).length===0)
 {
  return(
   <Container className="py-5 text-center">
    <Spinner animation="border"/>
   </Container>
  );
 }

 return(
  <Container className="py-5">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
     <h1 className="mb-0">Admin Permissions</h1>
     <div className="text-muted">Control access for dashboard modules and management pages</div>
    </div>
    <Button onClick={handleSaveAll} disabled={saving}>
     {saving?"Saving...":"Save Matrix"}
    </Button>
   </div>

   {alert&&<Alert variant={alert.variant}>{alert.message}</Alert>}
   {error&&<Alert variant="danger">{error}</Alert>}

   <Card className="mb-4">
    <Card.Body>
     <Row className="g-3">
      <Col md={3}>
       <Form.Group>
        <Form.Label>Scope</Form.Label>
        <Form.Select value={scope} onChange={handleScopeChange}>
         <option value="role">Role / Group</option>
         <option value="user">Individual User</option>
        </Form.Select>
       </Form.Group>
      </Col>

      {scope==="role"&&
       <Col md={3}>
        <Form.Group>
         <Form.Label>Role</Form.Label>
         <Form.Select value={selectedRole} onChange={handleRoleChange}>
          <option value="">Select role</option>
          {roles.map(role=>(
           <option key={String(role._id)} value={String(role._id)}>{role.name}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
      }

      {scope==="user"&&
       <Col md={6}>
        <Form.Group>
         <Form.Label>User</Form.Label>
         <Form.Select value={selectedUser} onChange={handleUserChange}>
          <option value="">Select user</option>
          {users.map(user=>(
           <option key={String(user._id)} value={String(user._id)}>{user.username} - {user.email}</option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>
      }
     </Row>
    </Card.Body>
   </Card>

   <Table striped hover responsive>
    <thead>
     <tr>
      <th>Module</th>
      <th>Create</th>
      <th>Read</th>
      <th>Update</th>
      <th>Delete</th>
      <th>Admin</th>
      <th>Source</th>
      <th></th>
     </tr>
    </thead>
    <tbody>
     {modules.map(module=>(
      <tr key={module}>
       <td className="text-capitalize">{module}</td>
       <td>
        <Form.Check
         type="checkbox"
         checked={!!matrix[module]?.create}
         onChange={()=>handlePermissionToggle(module,"create")}
        />
       </td>
       <td>
        <Form.Check
         type="checkbox"
         checked={!!matrix[module]?.read}
         onChange={()=>handlePermissionToggle(module,"read")}
        />
       </td>
       <td>
        <Form.Check
         type="checkbox"
         checked={!!matrix[module]?.update}
         onChange={()=>handlePermissionToggle(module,"update")}
        />
       </td>
       <td>
        <Form.Check
         type="checkbox"
         checked={!!matrix[module]?.delete}
         onChange={()=>handlePermissionToggle(module,"delete")}
        />
       </td>
       <td>
        <Form.Check
         type="checkbox"
         checked={!!matrix[module]?.admin}
         onChange={()=>handlePermissionToggle(module,"admin")}
        />
       </td>
       <td>
        {scope==="role"?
         <Badge bg="secondary">Role</Badge>
        :
         <Badge bg="info">User Override</Badge>
        }
       </td>
       <td>
        <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteRow(module)}>Clear</Button>
       </td>
      </tr>
     ))}
    </tbody>
   </Table>
  </Container>
 );
}

export default PermissionMatrix;