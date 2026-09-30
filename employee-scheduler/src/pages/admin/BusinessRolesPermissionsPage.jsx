// frontend/src/pages/admin/BusinessRolesPermissionsPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Row,Spinner,Table,Tabs,Tab} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Save,Shield,Trash2,UserCog} from "lucide-react";

const emptyRoleForm={name:"",business:"",description:"",isActive:true};
const emptyNewModuleForm={module:"",create:false,read:true,update:false,delete:false,admin:false};

export default function BusinessRolesPermissionsPage(){
 const [businesses,setBusinesses]=useState([]);
 const [selectedBusiness,setSelectedBusiness]=useState("");
 const [roles,setRoles]=useState([]);
 const [permissions,setPermissions]=useState([]);
 const [moduleOptions,setModuleOptions]=useState([]);
 const [loadingBusinesses,setLoadingBusinesses]=useState(false);
 const [loadingRoles,setLoadingRoles]=useState(false);
 const [loadingPermissions,setLoadingPermissions]=useState(false);
 const [loadingModules,setLoadingModules]=useState(false);
 const [savingRole,setSavingRole]=useState(false);
 const [savingPermissionById,setSavingPermissionById]=useState({});
 const [savingNewPermission,setSavingNewPermission]=useState(false);
 const [roleForm,setRoleForm]=useState(emptyRoleForm);
 const [editingRoleId,setEditingRoleId]=useState("");
 const [activeTab,setActiveTab]=useState("roles");
 const [message,setMessage]=useState({type:"",text:""});
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loadingBusinessTypes,setLoadingBusinessTypes]=useState(false);
 const [selectedPermissionRole,setSelectedPermissionRole]=useState("");
 const [newModuleForm,setNewModuleForm]=useState(emptyNewModuleForm);

 const api=async(url,options={})=>{
  const res=await fetch(url,{
   headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})},
   ...options
  });

  const data=await res.json().catch(()=>null);

  if(!res.ok)
   throw new Error(data?.message||data?.error||JSON.stringify(data)||`Request failed (${res.status})`);

  return data;
 };

 const getBusinessTypeName=typeRef=>{
  if(typeRef?.name)return typeRef.name;

  const typeId=typeof typeRef==="object"?typeRef?._id:typeRef;
  const match=businessTypes.find(type=>String(type._id)===String(typeId));

  return match?.name||"";
 };

 const getBusinessLabel=business=>{
  const typeName=getBusinessTypeName(business?.typeRef);
  return `${business?.legalName||business?.code||"Unnamed Business"}${typeName?` (${typeName})`:""}`;
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
   value:String(item?.value||item?.key||item?.module||""),
   label:String(item?.label||item?.name||item?.value||item?.key||item?.module||"")
  };
 };

 const normalizedModuleOptions=useMemo(()=>{
  return moduleOptions
   .map(normalizeModuleOption)
   .filter(module=>module.value);
 },[moduleOptions]);

 const roleOptions=useMemo(()=>{
  return roles.filter(role=>String(role.business?._id||role.business)===String(selectedBusiness));
 },[roles,selectedBusiness]);

 const selectedRolePermissions=useMemo(()=>{
  if(!selectedPermissionRole)return [];
  return permissions
   .filter(permission=>String(permission.role?._id||permission.role)===String(selectedPermissionRole))
   .sort((a,b)=>(a.module||"").localeCompare(b.module||""));
 },[permissions,selectedPermissionRole]);

 useEffect(()=>{
  fetchBusinesses();
  fetchBusinessTypes();
 },[]);

 useEffect(()=>{
  if(!selectedBusiness)
  {
   setRoles([]);
   setPermissions([]);
   setModuleOptions([]);
   setRoleForm(prev=>({...prev,business:""}));
   setSelectedPermissionRole("");
   return;
  }

  const businessId=String(selectedBusiness);

  setRoleForm(prev=>({...prev,business:businessId}));
  fetchRoles(businessId);
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
   setSelectedPermissionRole(String(roleOptions[0]._id));

  if(selectedPermissionRole&&!roleOptions.some(role=>String(role._id)===String(selectedPermissionRole)))
   setSelectedPermissionRole(roleOptions.length?String(roleOptions[0]._id):"");
 },[roleOptions,selectedBusiness,selectedPermissionRole]);

 const fetchBusinesses=async()=>{
  try{
   setLoadingBusinesses(true);
   setMessage({type:"",text:""});
   const res=await api("/api/businesses");
   const list=Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[];
   setBusinesses(list);

   if(!selectedBusiness&&list.length>0)
    setSelectedBusiness(String(list[0]._id));
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
  try{
   setLoadingModules(true);
   const res=await api(`/api/app-modules/business/${businessId}`);
   const list=Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[];
   setModuleOptions(list);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load modules"});
  }finally{
   setLoadingModules(false);
  }
 };

 const fetchRoles=async businessId=>{
  try{
   setLoadingRoles(true);
   const res=await api(`/api/users/roles?business=${businessId}`);
   setRoles(Array.isArray(res?.data)?res.data:Array.isArray(res)?res:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load roles"});
  }finally{
   setLoadingRoles(false);
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

 const resetRoleForm=()=>{
  setRoleForm({...emptyRoleForm,business:selectedBusiness,isActive:true});
  setEditingRoleId("");
 };

 const resetNewModuleForm=()=>{
  setNewModuleForm(emptyNewModuleForm);
 };

 const handleRoleChange=e=>{
  const {name,value,type,checked}=e.target;
  setRoleForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleNewModuleChange=e=>{
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

  if(!roleForm.name.trim()||!roleForm.business)
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
    business:roleForm.business,
    description:roleForm.description.trim(),
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

 const editRole=role=>{
  setActiveTab("roles");
  setEditingRoleId(String(role._id));
  setRoleForm({
   name:role.name||"",
   business:String(role.business?._id||role.business||selectedBusiness),
   description:role.description||"",
   isActive:role.isActive!==false
  });
  window.scrollTo({top:0,behavior:"smooth"});
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

  if(!selectedBusiness||!selectedPermissionRole||!newModuleForm.module.trim())
  {
   setMessage({type:"danger",text:"Business, role, and module are required"});
   return;
  }

  const moduleName=newModuleForm.module.trim();
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

  const isSaving=!!savingPermissionById[permission._id];

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

   updatePermissionRow(permission._id,{
    business:selectedBusiness,
    role:selectedPermissionRole,
    module:rowState.module.trim(),
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
      <Button variant="outline-danger" onClick={()=>deletePermission(permission._id)}>
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
         <div className="text-muted">Manage business roles and permissions by selected business.</div>
        </Col>

        <Col md={5}>
         <Form.Group>
          <Form.Label>Select Business</Form.Label>
          <div className="d-flex gap-2">
           <Form.Select value={selectedBusiness} onChange={e=>setSelectedBusiness(e.target.value)} disabled={loadingBusinesses}>
            <option value="">Select business</option>
            {businesses.map(b=>(
             <option key={b._id} value={b._id}>{getBusinessLabel(b)}</option>
            ))}
           </Form.Select>

           <Button variant="outline-secondary" onClick={fetchBusinesses} disabled={loadingBusinesses||loadingBusinessTypes}>
            {loadingBusinesses||loadingBusinessTypes?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
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
         <Card className="shadow-sm h-100">
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
                 <option key={b._id} value={b._id}>{getBusinessLabel(b)}</option>
                ))}
               </Form.Select>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Role Name</Form.Label>
               <Form.Control name="name" value={roleForm.name} onChange={handleRoleChange} required />
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Group>
               <Form.Label>Description</Form.Label>
               <Form.Control as="textarea" rows={4} name="description" value={roleForm.description} onChange={handleRoleChange}/>
              </Form.Group>
             </Col>

             <Col xs={12}>
              <Form.Check type="switch" id="roleIsActive" name="isActive" label="Active" checked={roleForm.isActive} onChange={handleRoleChange}/>
             </Col>

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
              <th>Description</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>

            <tbody>
             {!loadingRoles&&roles.length===0?(
              <tr>
               <td colSpan="4" className="text-center py-4 text-muted">No roles found.</td>
              </tr>
             ):null}

             {roles.map(role=>(
              <tr key={role._id}>
               <td>{role.name}</td>
               <td>{role.description||"-"}</td>
               <td>
                <Badge bg={role.isActive?"success":"secondary"}>{role.isActive?"Active":"Inactive"}</Badge>
               </td>
               <td className="text-end">
                <ButtonGroup size="sm">
                 <Button variant="outline-primary" onClick={()=>editRole(role)}>
                  <Edit size={14}/>
                 </Button>
                 <Button variant="outline-danger" onClick={()=>deleteRole(role._id)}>
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
              <Form.Select value={selectedBusiness} onChange={e=>setSelectedBusiness(e.target.value)} disabled={loadingBusinesses}>
               <option value="">Select business</option>
               {businesses.map(b=>(
                <option key={b._id} value={b._id}>{getBusinessLabel(b)}</option>
               ))}
              </Form.Select>
             </Form.Group>
            </Col>

            <Col md={6} lg={4}>
             <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={selectedPermissionRole} onChange={e=>setSelectedPermissionRole(e.target.value)} disabled={!selectedBusiness}>
               <option value="">Select role</option>
               {roleOptions.map(role=>(
                <option key={role._id} value={role._id}>{role.name}</option>
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
               <PermissionRow key={permission._id} permission={permission}/>
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